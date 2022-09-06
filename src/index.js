const http = require('http')
const routes = require('./routes')
const { URL } = require('url')
const bodyParser = require('./helpers/bodyParser')

const server = http.createServer((request, response) => {
  console.log(
    `Request method: ${request.method} Request endpoint: ${request.url}`
  )

  const parsedUrl = new URL(`http://localhost:3000${request.url}`)

  const { searchParams } = parsedUrl
  let { pathname } = parsedUrl

  let id = null

  const splitEndpoint = pathname.split('/').filter(Boolean)

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`
    id = splitEndpoint[1]
  }

  const route = routes.find(
    route => route.endpoint === pathname && route.method === request.method
  )

  if (route) {
    request.query = Object.fromEntries(searchParams)
    request.params = { id }

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(body))
    }

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response))
    } else {
      route.handler(request, response)
    }
  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    response.end(`Nao foi possivel obter ${request.method} ${pathname}`)
  }
})

server.listen(3000, () => {
  console.log('🚀 Servidor inicou: http://localhost:3000')
})
