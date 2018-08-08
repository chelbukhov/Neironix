const assert = require ('assert');              // утверждения
const ganache = require ('ganache-cli');        // тестовая сеть
const Web3 = require ('web3');                  // библиотека для подключения к ефириуму
//const web3 = new Web3(ganache.provider());      // настройка провайдера


require('events').EventEmitter.defaultMaxListeners = 0;


const compiledContract = require('../build/Crowdsale.json');

const compiledToken = require('../build/NRXtoken.json');

let accounts;
let contractAddress;
console.log(Date());


describe('Серия тестов для проверки функций контракта...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
    });
    

    it('Получаем стадию контракта, по умолчанию это init', async () => {
        const myState = await contract.methods.currentState().call({
            from: accounts[3],
            gas: "1000000"
        });
        assert(myState == 0);
    });

    it('Запускаем Sale Stage от собственника - должен отбить, так как время еще не пришло...', async () => {
        try {
            await contract.methods.startSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(false);    
        } catch (error) {
            assert(error);
        }

    });

    it('Проверка остатка токенов на адресе holdAddress1 9.8 млн...', async () => {
        let myAddress = await contract.methods.holdAddress1().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 9800000);
        console.log("holdAddress1: ", myBalance);
        //console.log("myAddress: ", myAddress);
    });

    it('Проверка остатка токенов на адресе holdAddress2 14 млн...', async () => {
        let myAddress = await contract.methods.holdAddress2().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 14000000);
        console.log("holdAddress2: ", myBalance);
        //console.log("myAddress: ", myAddress);
    });

    it('Проверка остатка токенов на адресе holdAddress3 14 млн...', async () => {
        let myAddress = await contract.methods.holdAddress3().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 14000000);
        console.log("holdAddress3: ", myBalance);
        //console.log("myAddress: ", myAddress);
    });

    it('Проверка остатка токенов на адресе holdAddress4 4.9 млн...', async () => {
        let myAddress = await contract.methods.holdAddress4().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 4900000);
        console.log("holdAddress4: ", myBalance);
        //console.log("myAddress: ", myAddress);
    });

    it('Проверка остатка токенов на адресе holdAddress5 4.2 млн...', async () => {
        let myAddress = await contract.methods.holdAddress5().call();

        let myBalance = await token.methods.balanceOf(myAddress).call();
        myBalance = web3.utils.fromWei(myBalance, 'ether');
        assert(myBalance == 4200000);
        console.log("holdAddress5: ", myBalance);
        //console.log("myAddress: ", myAddress);
    });

    // увеличиваем время в ganache-cli на 25 дней - до 1 сентября
    it('increase time for 25 days', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 25],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Запускаем Sale stage от собственника - должен отбить, т.к. адрес Neironix не установлен...', async () => {
        try {
            await contract.methods.startSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(false);    
        } catch (error) {
            assert(error);
        }

    });

    it('Устанавливаем адрес Neironix...', async () => {
        try {
            await contract.methods.setNeironixProfitAddress (accounts[1]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Устанавливаем адрес Marketing...', async () => {
        try {
            await contract.methods.setMarketingProfitAddress (accounts[2]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Устанавливаем адрес LawSupport...', async () => {
        try {
            await contract.methods.setLawSupportProfitAddress (accounts[3]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    }); 

    it('Устанавливаем адрес Hosting...', async () => {
        try {
            await contract.methods.setHostingProfitAddress (accounts[4]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    }); 

    it('Устанавливаем адрес Team...', async () => {
        try {
            await contract.methods.setTeamProfitAddress (accounts[5]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });     

    it('Устанавливаем адрес Contractors...', async () => {
        try {
            await contract.methods.setContractorsProfitAddress (accounts[6]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });  

    it('Устанавливаем адрес Saas...', async () => {
        try {
            await contract.methods.setSaasApiProfitAddress (accounts[7]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });  

    it('Запускаем Sale от собственника - должен принять...', async () => {
        try {
            await contract.methods.startSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Получаем стадию контракта, должен быть CrowsSale', async () => {
        const myState = await contract.methods.currentState().call({
            from: accounts[3],
            gas: "1000000"
        });
        assert(myState == 1);
    });

    it('Переводим 0.01 эфиров на контракт - должен отбить (минимум 0.1 эфира)...', async () => {
        try {
            let funders = await contract.methods.AddBalanceContract().send({
                    from: accounts[9],
                    value: 0.01*10**18,
                    gas: '1000000'
                });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('Переводим 0.1 эфиров на контракт - должен принять (минимум 0.1 эфира)...', async () => {
        try {
            let funders = await contract.methods.AddBalanceContract().send({
                    from: accounts[9],
                    value: 0.1*10**18,
                    gas: '1000000'
                });
            assert(true);
        } catch (error) {
            assert(false);
            //console.log(error);
        }
    });

    it('Переводим 9.9 эфиров на контракт - должен принять...', async () => {
        try {
            let funders = await contract.methods.AddBalanceContract().send({
                    from: accounts[9],
                    value: 9.9*10**18,
                    gas: '1000000'
                });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на контракте - должен быть ноль...', async () => {
        accBalance = await web3.eth.getBalance(contractAddress);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 0);
        console.log("Balance of contract: ", accBalance);
    });

    it('Проверка баланса на account[1] - должен быть 100 эфиров + 40% от 10 эфиров, т.е. 104 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 104);
        console.log("Balance of account[1]: ", accBalance);
    });

    it('Проверка баланса на account[2] - должен быть 100 эфиров + 30% от 10 эфиров, т.е. 103 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[2]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 103);
        console.log("Balance of account[2]: ", accBalance);
    });

    it('Проверка баланса на account[3] - должен быть 100 эфиров + 5% от 10 эфиров, т.е. 100.5 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[3]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 100.5);
        console.log("Balance of account[3]: ", accBalance);
    });

    it('Проверка баланса на account[4] - должен быть 100 эфиров + 5% от 10 эфиров, т.е. 100.5 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[4]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 100.5);
        console.log("Balance of account[4]: ", accBalance);
    });

    it('Проверка баланса на account[5] - должен быть 100 эфиров + 10% от 10 эфиров, т.е. 101 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[5]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 101);
        console.log("Balance of account[5]: ", accBalance);
    });

    it('Проверка баланса на account[6] - должен быть 100 эфиров + 5% от 10 эфиров, т.е. 100.5 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[6]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 100.5);
        console.log("Balance of account[6]: ", accBalance);
    });

    it('Проверка баланса на account[7] - должен быть 100 эфиров + 5% от 10 эфиров, т.е. 100.5 эфира...', async () => {
        accBalance = await web3.eth.getBalance(accounts[7]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 100.5);
        console.log("Balance of account[7]: ", accBalance);
    });

    it('Проверка поступления токенов на счет отправителя с учетом бонуса 35% = 942*10+35%=12717...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 12717);
        //console.log(tokenBalance);
    });

    // увеличиваем время в ganache-cli на 31 дней
    it('increase time for 31 days - 1 october', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 31],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Проверяем бонус - должен быть 15%', async () => {
        const myBonus = await contract.methods.setBonus().call({
            from: accounts[3],
            gas: "1000000"
        });
        assert(myBonus == 15);
    });



    it('Переводим 1 эфир на контракт...', async () => {
        try {
            let funders = await contract.methods.AddBalanceContract().send({
                    from: accounts[9],
                    value: 1*10**18,
                    gas: '1000000'
                });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });
    it('Проверка поступления токенов на счет отправителя с учетом бонуса 15% = 12717 + (942 + 15%) = 13800,3...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 13800.3);
        //console.log(tokenBalance);
    });

    it('Проверка перевода токенов между пользователями в период краудсейла - должен отбить...', async () => {
        try {
            let result = await token.methods.transfer(accounts[0], 1000).send({
                from: accounts[9],
                gas: '1000000'
            });
            assert(false);            
        } catch (error) {
            assert(error);
        }
 
    });

    // увеличиваем время в ganache-cli на 61 дней - 1 декабря
    it('increase time for 61 days - 1 december', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 61],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Переводим 1 эфир на контракт - должен отбить (пауза перед finishCrowdsale)...', async () => {
        try {
            let funders = await contract.methods.AddBalanceContract().send({
                    from: accounts[9],
                    value: 1*10**18,
                    gas: '1000000'
                });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('Получаем переменную контракта totalSupply - 140 млн', async () => {
        let myTotalSupply = await token.methods.totalSupply().call({
            from: accounts[3],
            gas: "1000000"
        });
        myTotalSupply = web3.utils.fromWei(myTotalSupply, 'ether');
        assert(myTotalSupply == 140000000);
        //console.log("totalSupply: ", myTotalSupply);
    });

    it('Проверка остатка токенов на контракте - должно быть более 93 млн...', async () => {
        let tokenBalance = await token.methods.balanceOf(contractAddress).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 93000000);
        //console.log(tokenBalance);
    });


    it('finishCrowdsale...', async () => {
        try {
            await contract.methods.finishCrowdSale().send({
                    from: accounts[0],
                    gas: '1000000'
                });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });  

    it('Получаем стадию контракта, должен быть WorkTime', async () => {
        const myState = await contract.methods.currentState().call({
            from: accounts[3],
            gas: "1000000"
        });
        assert(myState == 2);
    });

    it('Проверка остатка токенов на контракте - должно быть 0...', async () => {
        let tokenBalance = await token.methods.balanceOf(contractAddress).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        //console.log(tokenBalance);
    });

    it('Получаем переменную контракта totalSupply, должен измениться после сжигания токенов', async () => {
        let myTotalSupply = await token.methods.totalSupply().call({
            from: accounts[3],
            gas: "1000000"
        });
        myTotalSupply = web3.utils.fromWei(myTotalSupply, 'ether');
        assert(myTotalSupply == 46913800.3);
        console.log("totalSupply2:", myTotalSupply);
    });

    it('Проверка кол-ва токенов на accounts[9]...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        //assert(tokenBalance == 12717);
        console.log(tokenBalance);
    });

    it('Забираем токены у пользователя ...', async () => {
        try {
            let result = await contract.methods.acceptTokensFromUsers(accounts[9], "5000000000000000000000").send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });

    it('Получаем переменную контракта totalSupply, должен измениться на 5000 ...', async () => {
        let myTotalSupply = await token.methods.totalSupply().call({
            from: accounts[3],
            gas: "1000000"
        });
        myTotalSupply = web3.utils.fromWei(myTotalSupply, 'ether');
        assert(myTotalSupply == 46908800.3);
        console.log("totalSupply3:", myTotalSupply);
    });

    it('Проверка перевода токенов между пользователями ...', async () => {
        try {
            let result = await token.methods.transfer(accounts[0], 1000).send({
                from: accounts[9],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });

});





describe('Серия тестов для проверки адресов-держателей токенов команды, баунти и т.д...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
    });

    // увеличиваем время в ganache-cli на 25 дней - до 1 сентября
    it('increase time for 25 days', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 25],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Устанавливаем адрес Neironix...', async () => {
        try {
            await contract.methods.setNeironixProfitAddress (accounts[1]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Запускаем Crowd-Sale от собственника - должен принять...', async () => {
        try {
            await contract.methods.startSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка перевода токенов с адреса баунти ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromBountyAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });
    it('Проверка остатка токенов на account[9]...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 1000);
        //console.log(tokenBalance);
    });

    it('Проверка перевода токенов с адреса фонда проекта ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromProjectFundAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка остатка токенов на account[9] - 2000...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 2000);
        //console.log(tokenBalance);
    });

    it('Проверка перевода токенов с адреса команды - должен отбить (холд) ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromTeamAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(false);            
        } catch (error) {
            assert(error);
        }
    });
    it('Проверка перевода токенов с адреса партнеров - должен отбить (холд) ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromPartnersAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(false);            
        } catch (error) {
            assert(error);
        }
    });

    it('Проверка остатка токенов на account[9] - ...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        //assert(tokenBalance == 2000);
        console.log("balance: ",tokenBalance);
    });


    it('Проверка перевода токенов с адреса адвизоров - должен отбить (холд) ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromAdvisorsAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(false);            
        } catch (error) {
            assert(error);
        }
    });
    it('increase time for 180+91 days', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * (180+91)],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });

    it('Проверка остатка токенов на account[9] - ...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        //assert(tokenBalance == 2000);
        console.log("balance: ",tokenBalance);
    });


    it('Проверка перевода токенов с адреса команды - должен отбить (все еще холд) ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromTeamAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(false);            
        } catch (error) {
            assert(error);
        }
    });

    it('Проверка остатка токенов на account[9] - ...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        //assert(tokenBalance == 2000);
        console.log("balance: ",tokenBalance);
    });


    it('increase time for 3 days - it is half of the year', async () => {
        const myVal = await new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [60 * 60 * 24 * 3],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result))
    );
    });


    it('Проверка перевода токенов с адреса команды ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromTeamAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });



    it('Проверка перевода токенов с адреса партнеров ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromPartnersAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });
    
    it('Проверка перевода токенов с адреса адвизоров ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromAdvisorsAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка остатка токенов на account[9]...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 5000);
        console.log("balance: ", tokenBalance);
    });

    it('Проверка смены курса...', async () => {
        try {
            let tokenRate = await contract.methods.setRate(5000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка текущего курса...', async () => {
        let tokenRate = await contract.methods.tokenRate().call();
        assert(tokenRate == 5000);
    });

    it('Завершаем период распродажи - finishCrowdsale...', async () => {
        try {
            await contract.methods.finishCrowdSale().send({
                    from: accounts[0],
                    gas: '1000000'
                });
            assert(true);
        } catch (error) {
            assert(false);
        }
    });  

    it('Проверка перевода токенов с адреса фонда проекта ...', async () => {
        try {
            let result = await contract.methods.transferTokensFromProjectFundAddress(accounts[9], 1000).send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(true);            
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка остатка токенов на account[9]...', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[9]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 6000);
        console.log("balance: ", tokenBalance);
    });

});
