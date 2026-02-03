# Claude Code Instructions

## Core Expectations - READ THIS FIRST

**The user NEVER runs technical commands.** Claude handles ALL technical work:
- Running builds, tests, linters
- Running database migrations
- Deploying code
- Installing dependencies
- Any and all CLI operations

When Claude creates migrations, database changes, or any code that requires execution, Claude MUST run those commands immediately. Never tell the user to run something - just do it.

## Supabase Connection - CRITICAL

### Project Details
- **Project Ref**: `ofiicfommtwqijnmnaax`
- **Region**: `us-west-2` (NOT us-east-1!)
- **URL**: `https://ofiicfommtwqijnmnaax.supabase.co`

### Connection String (Pooler)
```
postgresql://postgres.ofiicfommtwqijnmnaax:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require
```

### How to Connect to Database

**Step 1: Get project region from Management API**
```bash
curl -s "https://api.supabase.com/v1/projects/ofiicfommtwqijnmnaax" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

**Step 2: Connect with correct region**
```bash
PGPASSWORD="$DB_PASSWORD" psql "postgresql://postgres.ofiicfommtwqijnmnaax@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Required Credentials
| Credential | Purpose | Where to Get |
|------------|---------|--------------|
| `SUPABASE_ACCESS_TOKEN` | CLI & Management API auth | Supabase Dashboard > Account > Access Tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side API access | Project Settings > API |
| `SUPABASE_DB_PASSWORD` | Direct DB connection | Project Settings > Database |

### Common Mistakes to AVOID

1. **Wrong region**: Don't assume `us-east-1`. ALWAYS check via Management API first.
2. **Using MCP when it's down**: If MCP fails, fall back to CLI immediately.
3. **Trying random connection strings**: Get the exact format from `/config/database/pooler` endpoint.
4. **Missing PAT**: The Personal Access Token (sbp_xxx) is REQUIRED for CLI operations.

### Supabase CLI Commands
```bash
# Link project (requires PAT)
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
supabase link --project-ref ofiicfommtwqijnmnaax

# Push migrations
supabase db push --include-all

# If password auth fails, check region first!
```

### MCP Configuration
The MCP is configured in `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_xxx",
        "--project-ref",
        "ofiicfommtwqijnmnaax"
      ]
    }
  }
}
```

## Environment Variables (Vercel)

All keys are stored in Vercel. To pull:
```bash
vercel env pull .env.local
```

Required vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_ACCESS_TOKEN`
- `OPENAI_API_KEY`

## Database Schema

### RLS Policies
All tables have Row Level Security with:
- **Admin**: Full access via JWT role claim
- **Customer**: Access to own records via `auth.uid()`
- **Anon**: Limited read/create for funnel flow

### Key Tables
- `leads` - Customer inquiries
- `contacts` - Contact info linked to leads
- `properties` - Property details
- `estimates` - Generated estimates
- `line_items` - Pricing line items (admin managed)
- `estimate_macros` - Reusable estimate templates

## API Routes

### Authentication
All admin routes use `requireAdmin()` from `lib/api/auth.ts`:
```typescript
import { requireAdmin } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin()
  if (error) return error
  // ... handler code
}
```

### Rate Limiting
AI endpoints are rate limited via `lib/rate-limit.ts`:
- `ai`: 10 requests/minute
- `aiVision`: 5 requests/minute

## Deployment

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

## Troubleshooting

### "Tenant or user not found"
**Cause**: Wrong pooler region
**Fix**: Check project region via Management API, use correct `aws-0-{region}.pooler.supabase.com`

### "Password authentication failed"
**Cause**: Wrong or stale DB password
**Fix**: Verify password in Supabase Dashboard > Settings > Database

### MCP tools not working
**Cause**: Missing PAT or service down
**Fix**:
1. Ensure `SUPABASE_ACCESS_TOKEN` is set in MCP config
2. Fall back to CLI: `supabase db push`

### API returns 401
**Cause**: Not authenticated or not admin
**Fix**: Login with admin account, check `user_metadata.role === 'admin'`
