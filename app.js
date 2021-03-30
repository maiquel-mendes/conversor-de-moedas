
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const showAlert = (err) => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err
  div.setAttribute('role', 'alert')
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'close')
  button.classList.add('btn-close')

  button.addEventListener('click', ()=>{
    div.remove()
  })

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (()=>{
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.rates){
        showAlert('O objeto precisa ter uma propriedade rates')
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()


const getUrl = currency => `https://api.exchangeratesapi.io/latest?base=${currency}`

const fetchExchangeRate = async (url) => {
  try {
    const response = await fetch(url)
    const exchangeRateData = await response.json();


    if (exchangeRateData.error) {
      throw new Error(exchangeRateData.error)
    }

    return state.setExchangeRate(exchangeRateData)

  } catch (err) {
    
    showAlert(err)
    
  }
}

const getOptions = (selectedCurrency, rates) => { 
  const setSelectedAttribute = currency => 
    currency === selectedCurrency ? 'selected' : '';

  return Object.keys(rates)
    .map(currency => `<option ${setSelectedAttribute(currency)} >${currency}</option>`)
    .join('')
}
const showInitialInfo = ({rates}) => {
  
  currencyOneEl.innerHTML = getOptions('USD', rates)
  currencyTwoEl.innerHTML = getOptions('BRL', rates)

  showUpdatedRates({rates})
}

const init = async ()=> {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if(exchangeRate.rates){
    showInitialInfo(exchangeRate)
  }
  
}

const getMultipliedExchangeRate = rates => {
  const currencyTwo = rates[currencyTwoEl.value]
  return (timesCurrencyOneEl.value * currencyTwo ).toFixed(2)
}

const showUpdatedRates = ({rates}) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(rates)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * rates[currencyTwoEl.value]} ${currencyTwoEl.value} `
}

timesCurrencyOneEl.addEventListener('input', () =>{
  const { rates } = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(rates)
})

currencyTwoEl.addEventListener('input', ()=> {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
})

currencyOneEl.addEventListener('input', async e => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)

  showUpdatedRates(exchangeRate)
})

init()


