const { main: csapiHandler } = require('./csapi/handler')

const csapiEvent = require('./events/csapi.json')

const event = {
  key: 'this is the value'
}

async function main () {
  // const csapi = await csapiHandler(event)
  // console.log({ csapi })
  console.log(csapiEvent)
}

main()
