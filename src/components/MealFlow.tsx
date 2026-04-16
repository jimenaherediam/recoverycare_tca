import { useState } from "react";
import { ArrowLeft, Phone, Utensils, CheckCircle2 } from "lucide-react";

type MealStep = "companion" | "phone" | "eating" | "questionnaire" | "done";

export type MealRecord = {
  id: number;
  date: string;
  companion: boolean;
  companionPhone?: string;
  answers: Record<string, string>;
};

const MealFlow = ({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (record: MealRecord) => void;
}) => {
  const [step, setStep] = useState<MealStep>("companion");
  const [hasCompanion, setHasCompanion] = useState(false);
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    { key: "what", label: "¿Qué has comido?" },
    { key: "amount", label: "¿Cuánto has comido?", options: ["Todo", "Más de la mitad", "Menos de la mitad", "Casi nada"] },
    { key: "feeling", label: "¿Cómo te has sentido durante la comida?", options: ["Bien", "Regular", "Mal", "Muy mal"] },
    { key: "anxiety", label: "¿Has sentido ansiedad?", options: ["Nada", "Un poco", "Bastante", "Mucha"] },
    { key: "notes", label: "¿Algo más que quieras anotar?" },
  ];

  const handleCompanion = (value: boolean) => {
    setHasCompanion(value);
    setStep(value ? "phone" : "eating");
  };

  const handlePhoneSubmit = () => {
    setStep("eating");
  };

  const handleFinishEating = () => {
    setStep("questionnaire");
  };

  const handleSubmitQuestionnaire = () => {
    const record: MealRecord = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      companion: hasCompanion,
      companionPhone: hasCompanion ? phone : undefined,
      answers,
    };
    onComplete(record);
    setStep("done");
  };

  const bg = "linear-gradient(180deg, hsl(45 100% 92%) 0%, hsl(320 50% 92%) 100%)";

  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === "companion") onBack();
            else if (step === "phone") setStep("companion");
            else if (step === "eating") setStep(hasCompanion ? "phone" : "companion");
            else if (step === "questionnaire") setStep("eating");
            else onBack();
          }}
          className="w-9 h-9 rounded-full bg-card/70 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Voy a comer</h1>
      </div>

      <div className="flex-1 px-5 flex flex-col">
        {/* STEP: Companion question */}
        {step === "companion" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center">¿Estás acompañado/a?</h2>
            <div className="w-full space-y-3 max-w-xs">
              <button
                onClick={() => handleCompanion(true)}
                className="w-full rounded-full py-3.5 text-base font-semibold bg-primary text-primary-foreground shadow-lg"
              >
                Sí
              </button>
              <button
                onClick={() => handleCompanion(false)}
                className="w-full rounded-full py-3.5 text-base font-semibold bg-secondary text-secondary-foreground"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* STEP: Phone number */}
        {step === "phone" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground text-center">
              Introduce el teléfono de tu acompañante
            </h2>
            <div className="w-full max-w-xs space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 612 345 678"
                className="w-full rounded-xl bg-card/80 border border-border/50 px-4 py-3.5 text-center text-lg font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
              />
              <button
                onClick={handlePhoneSubmit}
                disabled={!phone.trim()}
                className="w-full rounded-full py-3.5 text-base font-semibold bg-primary text-primary-foreground shadow-lg disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP: Eating */}
        {step === "eating" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Utensils className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Iniciando comida</h2>
              <p className="text-muted-foreground text-sm mt-2">Tómate tu tiempo. Estamos aquí contigo.</p>
            </div>
            <button
              onClick={handleFinishEating}
              className="w-full max-w-xs rounded-full py-3.5 text-base font-semibold bg-primary text-primary-foreground shadow-lg"
            >
              He terminado de comer
            </button>
          </div>
        )}

        {/* STEP: Questionnaire */}
        {step === "questionnaire" && (
          <div className="space-y-5 py-2">
            <h2 className="text-lg font-bold text-foreground">¿Cómo ha ido la comida?</h2>
            {questions.map((q) => (
              <div key={q.key} className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{q.label}</label>
                {q.options ? (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [q.key]: opt })}
                        className={`text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
                          answers[q.key] === opt
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/80 text-foreground border border-border/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={answers[q.key] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                    placeholder="Escribe aquí..."
                    className="w-full rounded-xl bg-card/80 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
                  />
                )}
              </div>
            ))}
            <button
              onClick={handleSubmitQuestionnaire}
              className="w-full rounded-full py-3.5 text-base font-semibold bg-primary text-primary-foreground shadow-lg mt-4"
            >
              Guardar
            </button>
          </div>
        )}

        {/* STEP: Done */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">¡Registrado!</h2>
            <p className="text-muted-foreground text-sm text-center">Tu comida se ha guardado correctamente.</p>
            <button
              onClick={onBack}
              className="rounded-full py-3 px-8 text-sm font-semibold bg-primary text-primary-foreground shadow-lg"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealFlow;
