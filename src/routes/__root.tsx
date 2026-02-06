import { HeadContent, Scripts, createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { ClerkProvider, SignedIn, SignedOut, SignInButton } from '@clerk/tanstack-react-start'
import { Button } from '@/components/ui/button'
import { ReloadPrompt } from '@/components/reload-prompt'
import { LogIn, FileQuestion } from 'lucide-react'

import appCss from '../styles.css?url'

import { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Buzzthing',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in p-8">
      <div className="bg-muted/50 p-6 rounded-full">
        <FileQuestion className="w-12 h-12 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl font-medium text-foreground">Page Not Found</p>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
      <Button variant="outline" asChild className="mt-4">
        <a href="/">Go to Dashboard</a>
      </Button>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/50 px-4 backdrop-blur-md sticky top-0 z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                  <SidebarTrigger className="-ml-1" />
                  <div className="mr-2 h-4 w-[1px] bg-border/50" />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground">Dashboard</span>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 ">
                  <SignedIn>
                    {children}
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
                      <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          BuzzThing Admin
                        </h2>
                        <p className="text-muted-foreground">Please authentication to continue</p>
                      </div>
                      <SignInButton mode="modal">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                          <LogIn className="w-5 h-5" />
                          Sign In to Dashboard
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </ClerkProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />

        <ReloadPrompt />
        <Scripts />
      </body>
    </html >
  )
}
