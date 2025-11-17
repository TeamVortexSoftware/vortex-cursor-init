---
description: Integrate Vortex invitations into the user's codebase with full implementation
---

# Vortex Integration Assistant

You are helping a developer integrate Vortex invitations into their application. Vortex is an **Invitations-as-a-Service** platform that handles invitation UI, email delivery, and tracking.

## Your Goal

Analyze their codebase, understand their tech stack, and implement Vortex with minimal effort from them.

## Vortex Credentials

**The user has already provided these during setup:**
- **API Key**: `{{VORTEX_API_KEY}}`
- **Widget ID**: `{{VORTEX_WIDGET_ID}}`

Use these values throughout the implementation. The API key has also been added to their `.env.local` file.

## Step 1: Understand Their Codebase

**Explore and identify:**
1. **Frontend Framework**: React, Next.js, Angular, Vue, React Native?
2. **Backend**: Node.js, Python, Ruby, Java, Go, etc.?
3. **Authentication System**: How do they manage users? (next-auth, Clerk, custom JWT, etc.)
4. **Grouping Mechanism**: What organizational structure do they have?
   - Workspaces, teams, organizations, projects, documents, channels, etc.
   - Where is this defined? (database models, TypeScript types, etc.)
5. **Existing Invitation Flow**: Do they have one? Where is it?

**Ask them:**
- "What's your main use case for invitations?" (e.g., "Users invite others to workspaces")
- Confirm the widget ID is correct: `{{VORTEX_WIDGET_ID}}`

## Step 2: Choose the Right Packages

### Frontend Packages

**React / Next.js:**
```bash
npm install @teamvortexsoftware/vortex-react @teamvortexsoftware/vortex-react-provider
```

**React Native:**
```bash
npm install @teamvortexsoftware/vortex-react-native react-native-svg react-native-vector-icons
```

**Angular:**
Choose based on their Angular version:
- Angular 20: `@teamvortexsoftware/vortex-angular-20`
- Angular 19: `@teamvortexsoftware/vortex-angular-19`
- Angular 14: `@teamvortexsoftware/vortex-angular-14`

### Backend Packages

**Next.js (App Router):**
```bash
npm install @teamvortexsoftware/vortex-nextjs-15-sdk
npx vortex-setup  # Auto-generates all API routes
```

**Node.js / Express:**
```bash
npm install @teamvortexsoftware/vortex-node-22-sdk
# or
npm install @teamvortexsoftware/vortex-express-5-sdk
```

**Python:**
```bash
pip install vortex-python-sdk
```

**Other Languages:**
- Ruby: `gem install vortex-ruby-sdk`
- Java: See packages/vortex-java-sdk/README.md
- Go: 
  1. Add `github.com/TeamVortexSoftware/vortex-go-sdk` to your `go.mod` dependencies (e.g., `go get github.com/TeamVortexSoftware/vortex-go-sdk@v1.0.0`)
  2. Run `go mod tidy` to install.
- C#: `dotnet add package VortexSoftware.Sdk`
- PHP: `composer require teamvortexsoftware/vortex-php-sdk`
- Rust: `cargo add vortex-rust-sdk`

## Step 3: Core Concepts to Implement

### JWT Authentication

**Why:** Vortex uses JWTs to authenticate users securely.

**New Simplified Format:**
```typescript
{
  user: {
    id: string;                  // Their internal user ID
    email: string;               // User's email address
    adminScopes?: string[];      // Optional: ['autoJoin'] grants auto-join admin privileges
  }
}
```

**Implementation:**
- JWT generation MUST happen server-side with their Vortex API key
- Never expose the API key to the frontend
- JWTs expire after 24 hours (VortexProvider handles refresh automatically)

**Example JWT Generation (Node.js/TypeScript):**
```typescript
import { generateJwt } from '@teamvortexsoftware/vortex-node-22-sdk';

const jwt = generateJwt({
  user: {
    id: user.id,
    email: user.email,
    adminScopes: user.isAdmin ? ['autoJoin'] : [], // Optional: grants auto-join admin privileges
  },
  apiKey: process.env.VORTEX_API_KEY,
});
```

**Example JWT Generation (Python):**
```python
from vortex_sdk import Vortex

vortex = Vortex(api_key=os.environ["VORTEX_API_KEY"])

jwt = vortex.generate_jwt(
    user={
        "id": user.id,
        "email": user.email,
        "admin_scopes": ["autoJoin"] if user.is_admin else []  # Optional
    }
)
```

**Example JWT Generation (Go):**
```go
import "github.com/vortexsoftware/vortex-go-sdk"

client := vortex.NewClient(os.Getenv("VORTEX_API_KEY"))

user := &vortex.User{
    ID:          user.ID,
    Email:       user.Email,
    AdminScopes: []string{"autoJoin"}, // Optional: grants auto-join admin privileges
}

jwt, err := client.GenerateJWT(user, nil)
```

### Scopes

**What:** Scopes represent any organizational unit in their app where invitations are targeted.

**Common scope types:**
- `workspace` - Top-level organizational unit
- `team` - Sub-group within organization
- `project` - Project or repository
- `document` - Shared document
- `channel` - Communication channel

**Important:**
- Scopes are THEIR data structure, Vortex just stores the reference
- When invitation is accepted, THEY create the actual membership in their database
- Each invitation targets one specific scope (e.g., scope="team-123", scopeType="team")

### Invitation Flow

1. **User sends invitation** → VortexInvite component
2. **Vortex sends email** → with link to their landing page
3. **Recipient clicks** → lands on `yourapp.com/landing?invitationId=xxx`
4. **Recipient signs up/logs in** → in your app
5. **Your backend calls** → `acceptInvitations()`
6. **You create membership** → in your database

## Step 4: Implementation Pattern

### For Next.js (Easiest)

**1. Run setup wizard:**
```bash
npx vortex-setup
```

**2. Configure authentication** in `lib/vortex-config.ts`:
```typescript
import { configureVortexLazy, createAllowAllAccessControl } from '@teamvortexsoftware/vortex-nextjs-15-sdk';

configureVortexLazy(async () => ({
  apiKey: process.env.VORTEX_API_KEY!,

  authenticateUser: async (request) => {
    // Use their existing auth system
    const session = await getSession(request); // Their auth function

    if (!session?.user) return null;

    return {
      userId: session.user.id,
      userEmail: session.user.email,
      adminScopes: session.user.isAdmin ? ['autoJoin'] : [], // Optional: grants auto-join admin privileges
    };
  },

  // For production, implement proper access control
  ...createAllowAllAccessControl(),
}));
```

**3. Add provider to layout** (`app/layout.tsx`):
```typescript
import '../lib/vortex-config';
import { VortexProvider } from '@teamvortexsoftware/vortex-react-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VortexProvider config={{ apiBaseUrl: '/api/vortex' }}>
          {children}
        </VortexProvider>
      </body>
    </html>
  );
}
```

**4. Use component** anywhere:
```typescript
import { VortexInvite } from '@teamvortexsoftware/vortex-react';
import { useVortexJWT } from '@teamvortexsoftware/vortex-react-provider';

function InviteButton({ workspace }) {
  const { jwt, isLoading } = useVortexJWT();

  return (
    <VortexInvite
      componentId="{{VORTEX_WIDGET_ID}}"
      jwt={jwt}
      isLoading={isLoading}
      scope={workspace.id}
      scopeType="workspace"
      onInvite={(data) => {
        console.log('Invitations sent!', data);
        // Optionally refresh your UI
      }}
    />
  );
}
```

### For React + Node.js Backend

**Backend (Express):**
```typescript
import { generateJwt, Vortex } from '@teamvortexsoftware/vortex-node-22-sdk';

const vortex = new Vortex(process.env.VORTEX_API_KEY);

// JWT endpoint
app.post('/api/vortex/jwt', authenticate, (req, res) => {
  const user = req.user; // From their auth middleware

  const jwt = generateJwt({
    user: {
      id: user.id,
      email: user.email,
      adminScopes: user.isAdmin ? ['autoJoin'] : [], // Optional
    },
    apiKey: process.env.VORTEX_API_KEY,
  });

  res.json({ jwt });
});

// Get invitation (for landing page)
app.get('/api/invitations/:id', async (req, res) => {
  const invitation = await vortex.getInvitation(req.params.id);
  res.json(invitation);
});

// Accept invitation (during signup)
app.post('/api/invitations/accept', async (req, res) => {
  const { email, invitationIds } = req.body;

  await vortex.acceptInvitations(invitationIds, {
    type: 'email',
    value: email
  });

  // NOW create actual memberships in your database
  for (const invitationId of invitationIds) {
    const invitation = await vortex.getInvitation(invitationId);
    await createMembership(email, invitation.scope, invitation.scopeType);
  }

  res.json({ success: true });
});
```

**Frontend:**
```typescript
import { VortexInvite } from '@teamvortexsoftware/vortex-react';

function InviteButton({ workspace }) {
  const [jwt, setJwt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vortex/jwt', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setJwt(data.jwt);
        setLoading(false);
      });
  }, []);

  return (
    <VortexInvite
      componentId="{{VORTEX_WIDGET_ID}}"
      jwt={jwt}
      isLoading={loading}
      scope={workspace.id}
      scopeType="workspace"
    />
  );
}
```

### For Angular

**1. Install package** (choose based on their Angular version):
```bash
npm install @teamvortexsoftware/vortex-angular-20  # Angular 20
# or
npm install @teamvortexsoftware/vortex-angular-19  # Angular 19
# or
npm install @teamvortexsoftware/vortex-angular-14  # Angular 14
```

**2. Backend JWT endpoint** (Node.js/Express):
```typescript
import { generateJwt } from '@teamvortexsoftware/vortex-node-22-sdk';

app.post('/api/vortex/jwt', authenticate, (req, res) => {
  const user = req.user;

  const jwt = generateJwt({
    user: {
      id: user.id,
      email: user.email,
      adminScopes: user.isAdmin ? ['autoJoin'] : [],
    },
    apiKey: process.env.VORTEX_API_KEY,
  });

  res.json({ jwt });
});
```

**3. Create Angular service** (`src/app/services/vortex.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VortexService {
  constructor(private http: HttpClient) {}

  getJwt(): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>('/api/vortex/jwt', {});
  }
}
```

**4. Use component in template**:
```typescript
// Component TypeScript
import { Component, OnInit } from '@angular/core';
import { VortexInviteComponent } from '@teamvortexsoftware/vortex-angular-20';
import { VortexService } from './services/vortex.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [VortexInviteComponent],
  template: `
    <div>
      <h2>Invite to {{ workspace.name }}</h2>
      <vortex-invite
        [componentId]="'{{VORTEX_WIDGET_ID}}'"
        [jwt]="jwt"
        [isLoading]="isLoading"
        [scope]="workspace.id"
        [scopeType]="'workspace'"
        (inviteSent)="onInviteSent($event)"
      />
    </div>
  `
})
export class WorkspaceComponent implements OnInit {
  jwt = '';
  isLoading = true;
  workspace = { id: 'ws-123', name: 'My Workspace' };

  constructor(private vortexService: VortexService) {}

  ngOnInit() {
    this.vortexService.getJwt().subscribe({
      next: (data) => {
        this.jwt = data.jwt;
        this.isLoading = false;
      },
      error: (err) => console.error('Failed to get JWT:', err)
    });
  }

  onInviteSent(data: any) {
    console.log('Invitations sent!', data);
  }
}
```

**5. For Angular 14** (non-standalone):
```typescript
// app.module.ts
import { VortexInviteModule } from '@teamvortexsoftware/vortex-angular-14';

@NgModule({
  imports: [
    // ... other imports
    VortexInviteModule
  ]
})
export class AppModule { }

// Component
@Component({
  selector: 'app-workspace',
  template: `
    <vortex-invite
      [componentId]="'{{VORTEX_WIDGET_ID}}'"
      [jwt]="jwt"
      [isLoading]="isLoading"
      [scope]="workspace.id"
      [scopeType]="'workspace'"
      (inviteSent)="onInviteSent($event)"
    ></vortex-invite>
  `
})
export class WorkspaceComponent {
  // ... same implementation as above
}
```

## Step 5: Landing Page

When someone clicks an invitation link, they land on: `yourapp.com/landing?invitationId=xxx`

**Implement the landing page:**
```typescript
// app/invite/landing/page.tsx (Next.js)
export default function InviteLanding({ searchParams }) {
  const invitationId = searchParams.invitationId;
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    if (invitationId) {
      fetch(`/api/invitations/${invitationId}`)
        .then(res => res.json())
        .then(setInvitation);
    }
  }, [invitationId]);

  if (!invitation) return <div>Loading...</div>;

  return (
    <div>
      <h1>{invitation.inviter} invited you to {invitation.groupName}</h1>
      <button onClick={() => signupAndAccept(invitationId)}>
        Accept Invitation
      </button>
    </div>
  );
}
```

**Configure in widget:** Set landing page URL to your route in the Vortex admin panel.

## Step 6: Component Configuration

Tell them to configure in Vortex admin (https://admin.vortexsoftware.com):
1. Create a component
2. Set landing page URL
3. Customize email template
4. Add template variables (optional)
5. Publish the component
6. Copy the component ID ({{VORTEX_WIDGET_ID}})

## Implementation Checklist

Use this checklist as you implement:

- [ ] Environment variables set (VORTEX_API_KEY)
- [ ] Backend package installed
- [ ] Frontend package installed
- [ ] JWT generation endpoint created
- [ ] VortexInvite component added to UI
- [ ] Landing page created and configured
- [ ] Invitation acceptance logic implemented
- [ ] Membership creation in database
- [ ] Component configured in admin panel
- [ ] Component ID added to code
- [ ] Tested invitation flow end-to-end

## Key Reminders

1. **JWT must be generated server-side** - Never expose API key to frontend
2. **Scopes are their data** - Vortex just stores references
3. **They create actual memberships** - After accepting invitation
4. **Landing page URL in component config** - Must match their route
5. **Use VortexProvider for React** - Simplifies state management
6. **Test in STG environment first** - Use STG API key for testing
7. **Component props**: Use `componentId`, `scope`, `scopeType` (not widgetId, groupId, groupType)

## Documentation References

- Main docs: https://docs.vortexsoftware.com
- Admin panel: https://admin.vortexsoftware.com
- Package locations in monorepo:
  - React: packages/vortex-react/README.md
  - Next.js SDK: packages/vortex-nextjs-15-sdk/README.md
  - Node.js SDK: packages/vortex-node-22-sdk/README.md
  - Python SDK: packages/vortex-python-sdk/README.md

## What to Generate

Based on their codebase, generate:

1. **Installation commands** - Exact commands for their package manager
2. **Environment variables** - .env file with their specific setup
3. **Backend code** - JWT generation and API routes
4. **Frontend code** - Component integration with their existing code
5. **Landing page** - Invitation acceptance flow
6. **Database updates** - If needed for membership creation
7. **Configuration guide** - Widget setup in admin panel

## Implementation Strategy

1. **Find their grouping mechanism** - Explore their codebase for workspace/team/org models
2. **Integrate with their auth** - Use their existing authentication
3. **Minimize changes** - Add Vortex without refactoring their code
4. **Follow their patterns** - Match their code style and structure
5. **Test thoroughly** - Create test scenarios for the invitation flow

---

**Now analyze their codebase and implement Vortex!**
