'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BlueprintGrid } from '@/components/landing/BlueprintGrid'
import { Navbar } from '@/components/landing/Navbar'
import { useTheme } from '@/context/theme-context'
import {
  Smartphone,
  Shield,
  Zap,
  Globe2,
  Lock,
  Send,
  CreditCard,
  Users,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react'

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <BlueprintGrid />
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-24 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-primary/5 backdrop-blur-sm"></div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Hero Text */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Send Money.<br/>No Passwords.
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
                The simplest way to send and receive money. No fees, no passwords, no hassle. Just scan and go.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  Download for iPhone
                </Button>
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-accent">
                  Download for Android
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>No transaction fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>100% secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Instant transfers</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Placeholder for phone mockup */}
                <div className="w-72 h-[600px] bg-gradient-to-br from-secondary to-accent border-4 border-border rounded-[3rem] shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Smartphone className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">App Screenshot Placeholder</p>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -left-4 top-20 bg-primary/10 border border-primary/30 rounded-lg p-3 backdrop-blur-sm">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -right-4 bottom-32 bg-primary/10 border border-primary/30 rounded-lg p-3 backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative px-4 py-16 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ridiculously Simple
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download the app, scan a QR code, and you're ready to send money. No sign-up forms, no passwords to remember.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border backdrop-blur-sm text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">1. Download App</h3>
                <p className="text-muted-foreground">
                  Get the tana app from the App Store or Google Play. Free and takes 30 seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">2. Scan QR Code</h3>
                <p className="text-muted-foreground">
                  Scan your unique QR code to create your identity. No email, no password needed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">3. Send Money</h3>
                <p className="text-muted-foreground">
                  Send to anyone, anywhere. Instantly. With zero transaction fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Showcase with Phone Screenshots */}
      <section className="relative px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-24">

          {/* Feature 1 - Send Money */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
                <span className="text-primary font-semibold text-sm">INSTANT TRANSFERS</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Send money in seconds
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Whether you're splitting dinner with friends or paying rent, sending money with tana is as easy as sending a text. No account numbers, no routing codes, just scan and send.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Instant confirmation - money arrives in seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe2 className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Send anywhere in the world, same speed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Zero transaction fees - keep 100% of your money</span>
                </li>
              </ul>
            </div>

            {/* Phone mockup placeholder */}
            <div className="flex justify-center">
              <div className="w-80 h-[650px] bg-gradient-to-br from-secondary to-accent border-4 border-border rounded-[3rem] shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Send className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Send Money Screenshot</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - No Passwords */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Phone mockup placeholder - on left for visual variety */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-80 h-[650px] bg-gradient-to-br from-secondary to-accent border-4 border-border rounded-[3rem] shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Lock className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Passwordless Auth Screenshot</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
                <span className="text-primary font-semibold text-sm">NO PASSWORDS</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Say goodbye to passwords forever
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your phone is your identity. No more forgotten passwords, no more security questions, no more getting locked out of your account. Just scan your QR code and you're in.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">More secure than passwords - uses cryptographic signatures</span>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Log in from any device by scanning with your phone</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Decentralized identity - you own your data, not us</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 - Pay for Things */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
                <span className="text-primary font-semibold text-sm">EVERYDAY PAYMENTS</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Pay at millions of stores
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Use tana anywhere you shop. Online or in-store, just scan the merchant's QR code to pay instantly. Support your local businesses without the credit card fees.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Accepted at thousands of businesses worldwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Support small businesses - they keep more of your payment</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">Faster checkout than credit cards or cash</span>
                </li>
              </ul>
            </div>

            {/* Phone mockup placeholder */}
            <div className="flex justify-center">
              <div className="w-80 h-[650px] bg-gradient-to-br from-secondary to-accent border-4 border-border rounded-[3rem] shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <CreditCard className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Payment Screenshot</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why Tana Section */}
      <section className="relative px-4 py-16 lg:px-8 bg-secondary/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why choose tana?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We built tana because traditional banking and payment apps are stuck in the past. Here's what makes us different.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardContent className="pt-6">
                <Zap className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Zero Fees</h3>
                <p className="text-muted-foreground text-sm">
                  No transaction fees. No monthly fees. No hidden charges. Keep 100% of your money.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm">
              <CardContent className="pt-6">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Bank-Level Security</h3>
                <p className="text-muted-foreground text-sm">
                  Military-grade encryption. Decentralized architecture. Your money is safer than in a traditional bank.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm">
              <CardContent className="pt-6">
                <Lock className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">You Own Your Data</h3>
                <p className="text-muted-foreground text-sm">
                  Decentralized identity means we can't access your data. You're in complete control.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm">
              <CardContent className="pt-6">
                <Globe2 className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Global by Default</h3>
                <p className="text-muted-foreground text-sm">
                  Send money across borders as easily as sending it across the street. Same speed, same (zero) fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to ditch passwords and fees?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of people who've already made the switch. Download tana today and experience the future of money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Download for iPhone
            </Button>
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-accent">
              Download for Android
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Available on iOS 14+ and Android 10+
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 py-12 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">tana</h3>
              <p className="text-muted-foreground text-sm">
                Send money without passwords or fees.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Light mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark mode</span>
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground/50 text-sm">
            <p>© 2024 tana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
