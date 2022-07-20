const file = require('./affiliate.json')

const message = file.Records[0].Sns.Message
const json = JSON.parse(message)

console.log(json)
