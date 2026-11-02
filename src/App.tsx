import AppLayout from "@/components/layout/AppLayout";
import Hero from "@/components/sections/Hero";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Button from "@/components/ui/Button";
import VisitorBot from "@/components/visitor-bot/VisitorBot";

export default function App() {
  return (
    <AppLayout>
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-lg font-semibold">Atharva Lohar</h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            That's the portfolio. The experiments, however, are far from over.
            Feel free to reach out, explore my projects, or just say hello.
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Button variant="ghost" href="https://github.com/Atharva-333">
              GitHub
            </Button>
            <Button
              variant="ghost"
              href="https://linkedin.com/in/atharva-lohar"
            >
              LinkedIn
            </Button>
            <Button variant="ghost" href={`https://mail.google.com/mail/?view=cm&fs=1&to=atharvalohar333@gmail.com`} >
              Email
            </Button>
          </div>
          <p className="mt-8 text-sm text-[var(--text-secondary)]">
            That's All, For Now.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            © 2026 Atharva Lohar. Still compiling...
          </p>
        </div>
      </footer>
      <VisitorBot />  
    </AppLayout>
  );
}
