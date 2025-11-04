# @teamvortexsoftware/vortex-cursor

> Add Vortex AI integration to your project for Cursor

## One-Line Setup

```bash
npx @teamvortexsoftware/vortex-cursor init
```

You'll be prompted for:
- Your Vortex API key
- Your widget ID

That's it! This adds AI-powered Vortex integration to your project with your credentials baked in.

## What It Does

Adds an `@integrate-vortex` prompt to Cursor that:
- Analyzes your codebase (framework, auth, grouping mechanism)
- Chooses the right Vortex SDK and components
- Generates all integration code
- Implements JWT endpoints
- Adds UI components
- Creates landing pages
- Configures everything

## How to Use

1. **Get your credentials**:
   - [API key](https://admin.vortexsoftware.com/members/api-keys)
   - [Widget ID](https://admin.vortexsoftware.com) (create a widget first)

2. **Run init** (one time):
   ```bash
   npx @teamvortexsoftware/vortex-cursor init
   ```
   Enter your API key and widget ID when prompted.

3. **Integrate Vortex in Cursor**:
   - Open Cursor Composer (Cmd/Ctrl + I)
   - Type: `@integrate-vortex`
   - Cursor analyzes your codebase and implements everything
   - Your credentials are already configured!

4. **Done!**
   - Full Vortex integration in ~30 minutes
   - Review and test the code

## Requirements

- [Cursor IDE](https://cursor.com)
- [Vortex API key](https://admin.vortexsoftware.com/members/api-keys)
- [Vortex widget](https://admin.vortexsoftware.com)

## Supported Tech Stacks

**Frontend:**
- React, Next.js
- React Native
- Angular (14, 19, 20)
- Vue (coming soon)

**Backend:**
- Node.js (Express, Fastify)
- Next.js App Router
- Python (Flask, Django)
- Ruby (Rails)
- Java (Spring Boot)
- Go, C#, PHP, Rust

## Example

```bash
# Initialize Vortex AI integration
npx @teamvortexsoftware/vortex-cursor init

# You'll see:
🚀 Setting up Vortex AI integration for Cursor...

First, we need your Vortex credentials:

Vortex API Key (from https://admin.vortexsoftware.com/members/api-keys): vortex_xxxxx
Widget ID (from https://admin.vortexsoftware.com): widget_yyyyy

✅ Credentials received
✅ Created .cursor/prompts/integrate-vortex.md
✅ Added VORTEX_API_KEY to .env.local

🎉 Setup complete!

# In Cursor, open Composer and type:
@integrate-vortex

# Cursor uses your credentials and implements everything!
```

## What Gets Implemented

✅ Backend JWT generation endpoint
✅ API routes for invitations
✅ Frontend component integration
✅ Landing page for invitation acceptance
✅ Database membership creation
✅ Environment variables
✅ Widget configuration guide

## Time to Integration

- **With AI**: ~30 minutes
- **Manual**: 4-6 hours

## Comparison with Claude Code

We also offer `@teamvortexsoftware/vortex-claude` for VS Code with Claude Code. Both tools provide the same integration experience:

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| Installation | `npx @teamvortexsoftware/vortex-claude init` | `npx @teamvortexsoftware/vortex-cursor init` |
| Usage | Type `/integrate-vortex` | Type `@integrate-vortex` |
| Credentials | Injected into slash command | Injected into prompt file |
| Location | `.claude/commands/` | `.cursor/prompts/` |

## Support

- [Documentation](https://docs.vortexsoftware.com)
- [Admin Panel](https://admin.vortexsoftware.com)
- [GitHub Issues](https://github.com/TeamVortexSoftware/vortex-suite/issues)

## License

Apache-2.0
