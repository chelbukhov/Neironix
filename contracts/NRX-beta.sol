pragma solidity ^0.4.23;


contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender)
        public view returns (uint256);

    function transferFrom(address from, address to, uint256 value)
        public returns (bool);

    function approve(address spender, uint256 value) public returns (bool);
    event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
    );
}



library SafeMath {

    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}



contract BasicToken is ERC20Basic {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    uint256 totalSupply_;

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
  
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

}

contract BurnableToken is BasicToken {

  event Burn(address indexed burner, uint256 value);

  /**
   * @dev Burns a specific amount of tokens.
   * @param _value The amount of token to be burned.
   */
  function burn(uint256 _value) public {
    _burn(msg.sender, _value);
  }

  function _burn(address _who, uint256 _value) internal {
    require(_value <= balances[_who]);

    balances[_who] = balances[_who].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
    emit Burn(_who, _value);
    emit Transfer(_who, address(0), _value);
  }
}

contract StandardToken is ERC20, BasicToken {

    mapping (address => mapping (address => uint256)) internal allowed;

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool)
    {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }


    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }


    function allowance(
        address _owner,
        address _spender
    )
    public
    view
    returns (uint256)
    {
        return allowed[_owner][_spender];
    }


    function increaseApproval(
        address _spender,
        uint _addedValue
    )
    public
    returns (bool)
    {
        allowed[msg.sender][_spender] = (
        allowed[msg.sender][_spender].add(_addedValue));
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }


    function decreaseApproval(
        address _spender,
        uint _subtractedValue
    )
        public
        returns (bool)
    {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}


contract NRXtoken is StandardToken, BurnableToken {
    string public constant name = "Neironix";
    string public constant symbol = "NRX";
    uint32 public constant decimals = 18;
    uint256 public INITIAL_SUPPLY = 300000000 * 1 ether;
    address public CrowdsaleAddress;
    bool public lockTransfers = false;

    constructor(address _CrowdsaleAddress) public {
    
        CrowdsaleAddress = _CrowdsaleAddress;
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;      
    }
  
    modifier onlyOwner() {
        // only Crowdsale contract
        require(msg.sender == CrowdsaleAddress);
        _;
    }

     // Override
    function transfer(address _to, uint256 _value) public returns(bool){
        if (msg.sender != CrowdsaleAddress){
            require(!lockTransfers, "Transfers are prohibited in Crowdsale period");
        }
        return super.transfer(_to,_value);
    }

     // Override
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool){
        if (msg.sender != CrowdsaleAddress){
            require(!lockTransfers, "Transfers are prohibited in Crowdsale period");
        }
        return super.transferFrom(_from,_to,_value);
    }
     
    function acceptTokens(address _from, uint256 _value) public onlyOwner returns (bool){
        require (balances[_from] >= _value);
        balances[_from] = balances[_from].sub(_value);
        balances[CrowdsaleAddress] = balances[CrowdsaleAddress].add(_value);
        emit Transfer(_from, CrowdsaleAddress, _value);
        return true;
    }

    function lockTransfer(bool _lock) public onlyOwner {
        lockTransfers = _lock;
    }



    function() external payable {
        // The token contract don`t receive ether
        revert();
    }  
}


contract Ownable {
    address public owner;
    address candidate;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        candidate = newOwner;
    }

    function confirmOwnership() public {
        require(candidate == msg.sender);
        owner = candidate;
        delete candidate;
    }

}

contract ProjectFundAddress {
    //Address where stored project fund tokens- 5%
    function() external payable {
        // The contract don`t receive ether
        revert();
    } 
}


contract TeamAddress {
    //Address where stored command tokens- 10%
    //Withdraw tokens allowed only after 0.5 year
    function() external payable {
        // The contract don`t receive ether
        revert();
    } 
}

contract PartnersAddress {
    //Address where stored partners tokens- 10%
    //Withdraw tokens allowed only after 0.5 year
    function() external payable {
        // The contract don`t receive ether
        revert();
    } 
}

contract AdvisorsAddress {
    //Address where stored advisors tokens- 5%
    //Withdraw tokens allowed only after 0.5 year
    function() external payable {
        // The contract don`t receive ether
        revert();
    } 
}

contract BountyAddress {
    //Address where stored bounty tokens- 5%
    function() external payable {
        // The contract don`t receive ether
        revert();
    } 
}


contract Crowdsale is Ownable {
    using SafeMath for uint; 
    event LogStateSwitch(State newState);
    event Withdraw(address indexed from, address indexed to, uint256 amount);

    address myAddress = this;

    uint64 preSaleStartTime = 0;
    uint64 preSaleEndTime = 0;
    uint64 crowdSaleStartTime = 0;
    uint64 crowdSaleEndTime = 0;

    uint public  tokenRate = 3400;  //tokens for 1 ether




    
    NRXtoken public token = new NRXtoken(myAddress);
    /*
    * @autor Alex Chelbukhov
    */
    
    // @dev New address for hold tokens
    ProjectFundAddress public holdAddress1 = new ProjectFundAddress();
    TeamAddress public holdAddress2 = new TeamAddress();
    PartnersAddress public holdAddress3 = new PartnersAddress();
    AdvisorsAddress public holdAddress4 = new AdvisorsAddress();
    BountyAddress public holdAddress5 = new BountyAddress();

    // @dev Create state of contract
    enum State { 
        Init,    
        PreSale, 
        CrowdSale,
        WorkTime
    }
        
    State public currentState = State.Init;

    modifier onlyInState(State state){ 
        require(state==currentState); 
        _; 
    }

    constructor() public {
        uint256 TotalTokens = token.INITIAL_SUPPLY().div(1 ether);
        // distribute tokens
        // Transer tokens to project fund address.  (5%)
        _transferTokens(address(holdAddress1), TotalTokens.div(20));
        // Transer tokens to team address.  (10%)
        _transferTokens(address(holdAddress2), TotalTokens.div(10));
        // Transer tokens to partners address. (10%)
        _transferTokens(address(holdAddress3), TotalTokens.div(10));
        // Transer tokens to advisors address. (5%)
        _transferTokens(address(holdAddress4), TotalTokens.div(20));
        // Transer tokens to bounty address. (5%)
        _transferTokens(address(holdAddress5), TotalTokens.div(20));
        
        /* Create periods
        * PreSale between 01/09/2018 and 15/09/2018
        * TokenSale between 30/09/2018 and 30/10/2018
        * Unix timestamp 01/09/2018 - 1535760000
        */
        preSaleStartTime = 1535760000;
        preSaleEndTime = preSaleStartTime + 14 days;
        crowdSaleStartTime = preSaleStartTime + 29 days;
        crowdSaleEndTime = preSaleStartTime + 59 days;
        
        
    }

    function returnTokensFromProjectFundAddress(uint256 _value) internal returns(bool){
        // the function take tokens from ProjectFundAddress  to contract
        // not hold
        // the sum is entered in whole tokens (1 = 1 token)
        uint256 value = _value;
        require (value >= 1);
        value = value.mul(1 ether);
        token.acceptTokens(address(holdAddress1), value); 
        return true;
    } 

    function returnTokensFromTeamAddress(uint256 _value) internal returns(bool){
        // the function take tokens from TeamAddress to contract
        // only after 182 days
        // the sum is entered in whole tokens (1 = 1 token)
        uint256 value = _value;
        require (value >= 1);
        value = value.mul(1 ether);
        require (now >= preSaleStartTime + 182 days, "only after 182 days");
        token.acceptTokens(address(holdAddress2), value);    
        return true;
    } 
    
    function returnTokensFromPartnersAddress(uint256 _value) internal returns(bool){
        // the function take tokens from PartnersAddress to contract
        // only after 182 days
        // the sum is entered in whole tokens (1 = 1 token)
        uint256 value = _value;
        require (value >= 1);
        value = value.mul(1 ether);
        require (now >= preSaleStartTime + 182 days, "only after 182 days");
        token.acceptTokens(address(holdAddress3), value);    
        return true;
    } 
    
    function returnTokensFromAdvisorsAddress(uint256 _value) internal returns(bool){
        // the function take tokens from AdvisorsAddress to contract
        // only after 182 days
        // the sum is entered in whole tokens (1 = 1 token)
        uint256 value = _value;
        require (value >= 1);
        value = value.mul(1 ether);
        require (now >= preSaleStartTime + 182 days, "only after 182 days");
        token.acceptTokens(address(holdAddress4), value);    
        return true;
    }     
    
    function returnTokensFromBountyAddress(uint256 _value) internal returns(bool){
        // the function take tokens from BountyAddress to contract
        // not hold
        // the sum is entered in whole tokens (1 = 1 token)
        uint256 value = _value;
        require (value >= 1);
        value = value.mul(1 ether);
        token.acceptTokens(address(holdAddress5), value);    
        return true;
    }     


    function _transferTokens(address _newInvestor, uint256 _value) internal {
        require (_newInvestor != address(0));
        require (_value >= 1);
        uint256 value = _value;
        value = value.mul(1 ether);
        token.transfer(_newInvestor, value);
    }  
    
    function transferTokensFromProjectFundAddress(address _newInvestor, uint256 _value) public onlyOwner {
        // the sum is entered in whole tokens (1 = 1 token)
        if (returnTokensFromProjectFundAddress(_value)){
            _transferTokens(_newInvestor, _value);
        }
    }

    function transferTokensFromTeamAddress(address _newInvestor, uint256 _value) public onlyOwner {
        // the sum is entered in whole tokens (1 = 1 token)
        if (returnTokensFromTeamAddress(_value)){
            _transferTokens(_newInvestor, _value);
        }
    }

    function transferTokensFromPartnersAddress(address _newInvestor, uint256 _value) public onlyOwner {
        // the sum is entered in whole tokens (1 = 1 token)
        if (returnTokensFromPartnersAddress(_value)){
            _transferTokens(_newInvestor, _value);
        }
    }

    function transferTokensFromAdvisorsAddress(address _newInvestor, uint256 _value) public onlyOwner {
        // the sum is entered in whole tokens (1 = 1 token)
        if (returnTokensFromAdvisorsAddress(_value)){
            _transferTokens(_newInvestor, _value);
        }
    }

    function transferTokensFromBountyAddress(address _newInvestor, uint256 _value) public onlyOwner {
        // the sum is entered in whole tokens (1 = 1 token)
        if (returnTokensFromBountyAddress(_value)){
            _transferTokens(_newInvestor, _value);
        }
    }
    


    function setState(State _state) internal {
        currentState = _state;
        emit LogStateSwitch(_state);
    }

    function startPreSale() public onlyOwner onlyInState(State.Init) {
        setState(State.PreSale);
        token.lockTransfer(true);
    }


    function finishCrowdSale() public onlyOwner onlyInState(State.CrowdSale) {
        require (now > crowdSaleEndTime, "CrowdSale stage is not over");
        setState(State.WorkTime);
        token.lockTransfer(false);
        // burn all unsolded tokens
        token.burn(token.balanceOf(myAddress));
    }


    function blockExternalTransfer() public onlyOwner onlyInState (State.WorkTime){
        //Blocking all external token transfer
        require (token.lockTransfers() == false);
        token.lockTransfer(true);
    }

    function unBlockExternalTransfer() public onlyOwner onlyInState (State.WorkTime){
        //Unblocking all external token transfer
        require (token.lockTransfers() == true);
        token.lockTransfer(false);
    }


    function calcBonus () public view returns(uint256) {
        // calculation bonus
        uint256 actualBonus = 0;
        if (currentState == State.PreSale){
            actualBonus = 20;
        }
        if (currentState == State.PreICO){
            actualBonus = 10;
        }
        return actualBonus;
    }

 
    function saleTokens() internal {
        require(currentState != State.Init, "Contract is init, do not accept ether."); 
        //calculation length of periods, pauses, auto set next stage
        if (currentState == State.PreSale) {
            if ((uint64(now) > preSaleStartTime + 10 days) && (uint64(now) <= preSaleStartTime + 40 days)){
                require (false, "It is pause after PreSale stage - contract do not accept ether");
            }
            if (uint64(now) > preSaleStartTime + 40 days){
                setState(State.PreICO);
                preICOStartTime = uint64(now);
            }
        }

        if (currentState == State.PreICO) {
            if ((uint64(now) > preICOStartTime + 15 days) && (uint64(now) <= preICOStartTime + 45 days)){
                require (false, "It is pause after PreICO stage - contract do not accept ether");
            }
            if (uint64(now) > preICOStartTime + 45 days){
                setState(State.CrowdSale);
                crowdSaleStartTime = uint64(now);
            }
        }        
        
        if (currentState == State.CrowdSale) {
            if ((uint64(now) > crowdSaleStartTime + 30 days) && (uint64(now) <= crowdSaleStartTime + 60 days)){
                require (false, "It is pause after CrowdSale stage - contract do not accept ether");
            }
            if (uint64(now) > crowdSaleStartTime + 60 days){
                // autofinish CrowdSale stage
                if (soldTokens < TOKEN_SOFT_CAP) {
                    // softcap don"t accessable - refunding
                    setState(State.Refunding);
                } else {
                    // All right! CrowdSale is passed. WithdrawProfit is accessable
                    setState(State.WorkTime);
                    token.lockTransfer(false);
                }
            }
        }        
        
        uint tokens = saleRate.mul(msg.value);
        if (currentState == State.PreSale) {
            require (RPESALE_TOKEN_SUPPLY_LIMIT > soldTokens.add(tokens), "HardCap of Pre-Sale is excedded."); 
            require (msg.value >= 20 ether, "Minimum 20 ether for transaction all Pre-Sale period");
        }
        if (currentState == State.PreICO) {
            require (RPEICO_TOKEN_SUPPLY_LIMIT > soldTokens.add(tokens), "HardCap of Pre-ICO is excedded.");
            if (uint64(now) < preICOStartTime + 1 days){
                uint limitPerUser = crowdsaleBalances[msg.sender] + msg.value;
                require (limitPerUser <= 20 ether, "Maximum is 20 ether for user in first day of Pre-ICO");
            }
        }
        tokens = tokens.add(tokens.mul(calcBonus()).div(100));
        crowdsaleBalances[msg.sender] = crowdsaleBalances[msg.sender].add(msg.value);
        token.transfer(msg.sender, tokens);
        soldTokens = soldTokens.add(tokens);
    }
 

    function withdrawProfit (address _to, uint256 _value) public onlyOwner payable {
    // withdrawProfit - only if coftcap passed
        require (currentState == State.WorkTime, "Contract is not at WorkTime stage. Access denied.");
        // здесь будет распределение средств по адресам
        
        require (myAddress.balance >= _value);
        require(_to != address(0));
        _to.transfer(_value);
        emit Withdraw(msg.sender, _to, _value);
    }


    function() external payable {
        saleTokens();
    }    
 
// !!!     убрать нижние функции перед развертыванием   !!!

    function AddBalanceContract () public payable {
        // для пополнения баланса при тестировании
        saleTokens();
    }




}