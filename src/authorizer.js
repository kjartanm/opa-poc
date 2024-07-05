import policyWasm from './opa/policy.wasm'
import { loadPolicy } from '@open-policy-agent/opa-wasm'

const SECONDS = 1000

export class OPAAuthorizer {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.updatedAt = 0
  }

  async fetch(request) {
    let input
    try {
      input = await request.json()
    } catch (error) {
      return new Response('Bad Request.', { status: 400 })
    }

    if (!this.policy) {
      this.policy = await loadPolicy(policyWasm).catch((error) => {
        return new Response('Failed to load policy.', { status: 500 })
      })
    }

    if (!this.tenant) {
      const url = new URL(request.url)
      const tenant = url.pathname.substring(1).toLowerCase()
      const data = await this.env.TENANT_DATA.get(tenant)
      if (data === null) {
        return new Response('Not Found.', { status: 404 })
      } else {
        this.policy.setData(JSON.parse(data))
        this.updatedAt = Date.now()
        this.tenant = tenant
      }
    }

    const currentAlarm = await this.state.storage.getAlarm()
    if (currentAlarm === null) {
      this.state.storage.setAlarm(Date.now() + 180 * SECONDS)
    }

    const resultSet = this.policy.evaluate(input)

    return new Response(JSON.stringify(resultSet), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'x-updatedat': this.updatedAt,
      },
    })
  }

  async alarm() {
    const data = await this.env.TENANT_DATA.get(this.tenant)
    if (data) {
      this.policy.setData(JSON.parse(data))
      this.updatedAt = Date.now()
    }
  }
}
