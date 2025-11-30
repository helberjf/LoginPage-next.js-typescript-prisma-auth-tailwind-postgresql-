import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-white font-bold text-2xl">AM</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Bem-vindo ao{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              AuthMarketplace
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa de autenticação e marketplace para seus negócios.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href="/login">
            <Button size="lg" className="w-full sm:w-auto bg-primary">
              Entrar
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <a href="/register">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
            >
              Criar Conta
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
