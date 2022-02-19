// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VestingContract is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    event Paused(address account);
    event Unpaused(address account);

    event ScheduleCreated(
        address indexed _beneficiary,
        uint256 indexed _amount,
        uint256 indexed _start,
        uint256 _duration
    );

    event ScheduleCancelled(
        address indexed _beneficiary,
        address indexed _cancelledBy,
        uint256 _remainingBalance,
        uint256 _end
    );

    event DrawDown(
        address indexed _beneficiary,
        uint256 indexed _amount,
        uint256 indexed _time
    );

    struct Schedule {
        uint256 start;
        uint256 end;
        uint256 cliff;
        uint256 amount;
        uint256 totalDrawn;
        uint256 lastDrawnAt;
        uint256 drawDownRate;
    }

    // Vested address to its schedule
    mapping(address => Schedule) public vestingSchedule;

    // The Mansaa token contract
    IERC20 private token;

    uint256 public constant PERIOD_ONE_DAY_IN_SECONDS = 1 days;

    bool public paused;

    modifier whenNotPaused() {
        require(!paused, "VestingContract: Method cannot be invoked as contract has been paused");
        _;
    }

    /**
     * @dev Creates a vesting contract.
     * @param token_ address of the ERC20 token contract
     */
    constructor(address token_) {
        require(token_ != address(0x0));
        token = IERC20(token_);
    }

    function createVestingSchedule(address _beneficiary, uint256 _amount, uint256 _start, uint256 _durationInDays, uint256 _cliffDurationInDays) external onlyOwner {
        require(_beneficiary != address(0), "VestingContract.createVestingSchedule: Beneficiary cannot be empty");
        require(_amount > 0, "VestingContract.createVestingSchedule: Amount cannot be empty");
        require(_durationInDays > 0, "VestingContract.createVestingSchedule: Duration cannot be empty");
        require(_cliffDurationInDays <= _durationInDays, "VestingContract.createVestingSchedule: Cliff can not be bigger than duration");

        // Ensure one per address
        require(vestingSchedule[_beneficiary].amount == 0, "VestingContract.createVestingSchedule: Schedule already in flight");

        // Create schedule
        uint256 _durationInSecs = _durationInDays.mul(PERIOD_ONE_DAY_IN_SECONDS);
        uint256 _cliffDurationInSecs = _cliffDurationInDays.mul(PERIOD_ONE_DAY_IN_SECONDS);
        vestingSchedule[_beneficiary] = Schedule({
            start : _start,
            end : _start.add(_durationInSecs),
            cliff : _start.add(_cliffDurationInSecs),
            amount : _amount,
            totalDrawn : 0, // no tokens drawn yet
            lastDrawnAt : 0, // never invoked
            drawDownRate : _amount.div(_durationInSecs)
            });

        emit ScheduleCreated(_beneficiary, _amount, _start, _durationInDays);

        // Escrow tokens in the vesting contract on behalf of the beneficiary
        require(token.transferFrom(msg.sender, address(this), _amount), "VestingContract.createVestingSchedule: Unable to transfer tokens to vesting contract");
    }

    function drawDown() whenNotPaused nonReentrant external {
        Schedule storage schedule = vestingSchedule[msg.sender];
        require(schedule.amount > 0, "VestingContract.drawDown: There is no schedule currently in flight");

        // available right now
        uint256 amount = _availableDrawDownAmount(msg.sender);
        require(amount > 0, "VestingContract.drawDown: Nothing to withdraw");

        // Update last drawn to now
        schedule.lastDrawnAt = _getNow();

        // Increase total drawn amount
        schedule.totalDrawn = schedule.totalDrawn.add(amount);

        // Issue tokens to beneficiary
        require(token.transfer(msg.sender, amount), "VestingContract.drawDown: Unable to transfer tokens");

        emit DrawDown(msg.sender, amount, _getNow());
    }

    function pause() external onlyOwner {

        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {

        paused = false;
        emit Unpaused(msg.sender);
    }

    ///////////////
    // Accessors //
    ///////////////

    function tokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function vestingScheduleForBeneficiary(address _beneficiary) external view returns (uint256 _start, uint256 _end, uint256 _cliff, uint256 _amount, uint256 _totalDrawn, uint256 _lastDrawnAt, uint256 _drawDownRate, uint256 _remainingBalance) {
        Schedule memory schedule = vestingSchedule[_beneficiary];
        return (
        schedule.start,
        schedule.end,
        schedule.cliff,
        schedule.amount,
        schedule.totalDrawn,
        schedule.lastDrawnAt,
        schedule.drawDownRate,
        schedule.amount.sub(schedule.totalDrawn)
        );
    }

    function availableDrawDownAmount(address _beneficiary) external view returns (uint256 _amount) {
        return _availableDrawDownAmount(_beneficiary);
    }

    //////////////
    // Internal //
    //////////////

    function _getNow() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _availableDrawDownAmount(address _beneficiary) internal view returns (uint256 _amount) {
        Schedule memory schedule = vestingSchedule[_beneficiary];

        // Cliff

        // the cliff period has not ended, therefore, no tokens to draw down
        if (_getNow() <= schedule.cliff) {
            return 0;
        }

        // Ended
        if (_getNow() > schedule.end) {
            return schedule.amount.sub(schedule.totalDrawn);
        }

        // Active

        // Work out when the last invocation was
        uint256 timeLastDrawnOrStart = schedule.lastDrawnAt == 0 ? schedule.start : schedule.lastDrawnAt;

        // Find out how much time has past since last invocation
        uint256 timePassedSinceLastInvocation = _getNow().sub(timeLastDrawnOrStart);

        // Work out how many due tokens - time passed * rate per second
        return timePassedSinceLastInvocation.mul(schedule.drawDownRate);
    }
}