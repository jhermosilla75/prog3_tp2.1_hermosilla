class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl, currencies = []) {
        this.apiUrl = apiUrl;
        this.currencies = currencies;

    }

    async getCurrencies() {
        try{
            const response = await fetch(`${this.apiUrl}/currencies`)
            const monedas = await response.json();
            Object.entries(monedas).forEach(([codigo, nombre]) => {
                let tipoMoneda = new Currency(codigo, nombre);
                this.currencies.push(tipoMoneda);
            });

            

        } catch(error){
            console.error(error);
        }
                
    }
    getYesterdayDate(){
        const today = new Date();
        today.setDate(today.getDate() - 1);
    
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency == toCurrency || amount <= 0){
            return parseFloat(amount);
        }
        try{
            const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
            if (response.ok){
            const convertida = await response.json();
            return convertida.rates[toCurrency.code];
            }
            
        } catch(error){
                console.log(error);
        }
        
    }

    async convertCurrency1(amount, fromCurrency, toCurrency){
        try{
            const ayer = this.getYesterdayDate();
            //console.log(ayer);
            const response = await fetch(`${this.apiUrl}/${ayer}?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
            if (response.ok){
            const convertida = await response.json();
            console.log(convertida.rates);
            return convertida.rates[toCurrency.code];
            }

        } catch(error){
            console.log(error);
        }
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const resultDiv1 = document.getElementById("result1");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount) && convertedAmount > 0) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }


        const convertedAmount1 = await converter.convertCurrency1(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount1 !== null && !isNaN(convertedAmount1) && convertedAmount1 > 0) {
            resultDiv1.textContent = `AYER ${amount} ${fromCurrency.code} son ${convertedAmount1.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }



    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
