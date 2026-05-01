import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/schema'

export async function GET() {
  try {
    const usersResult = await db.select().from(users).limit(1)
    const accountsResult = await db.select().from(accounts).limit(1)
    const sessionsResult = await db.select().from(sessions).limit(1)
    const tokensResult = await db.select().from(verificationTokens).limit(1)
    
    return Response.json({ 
      success: true, 
      users: usersResult,
      accounts: accountsResult,
      sessions: sessionsResult,
      verificationTokens: tokensResult
    })
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      message: error.message,
      cause: error.cause,
      stack: error.stack
    }, { status: 500 })
  }
}
