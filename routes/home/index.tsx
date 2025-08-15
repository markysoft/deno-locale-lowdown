import { Hono } from 'hono'
import { Layout } from './components/Layout.tsx'

const app = new Hono()

app.get('/', (c) => {
  return c.render(<Layout />)
})

export default app
