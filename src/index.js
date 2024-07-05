export { OPAAuthorizer } from './authorizer'

const fetch = async (request, env) => {
  let url = new URL(request.url)

  //Get the tenant from the path
  let tenant = url.pathname.substring(1)
  if (!tenant) {
    return new Response('Bad Request.', { status: 400 })
  } else if (request.method !== 'POST') {
    return new Response('Method not allowed.', { status: 405 })
  }

  // Get the Durable Object linked to the tenant
  let objId = env.AUTHORIZER.idFromName(tenant)
  let durableObject = env.AUTHORIZER.get(objId)
  let response = await durableObject.fetch(request)
  return response
}

export default {
  fetch,
}