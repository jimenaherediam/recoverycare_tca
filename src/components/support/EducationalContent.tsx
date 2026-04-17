import { ArrowLeft } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const articles = [
  {
    category: "Trastornos de la Conducta Alimentaria",
    items: [
      {
        title: "¿Qué es un TCA?",
        body: "Los Trastornos de la Conducta Alimentaria (TCA) son enfermedades mentales graves caracterizadas por una relación alterada con la comida, el peso y la imagen corporal. Los más frecuentes son la anorexia nerviosa, la bulimia nerviosa y el trastorno por atracón. Tienen origen multifactorial: biológico, psicológico y social.",
      },
      {
        title: "Señales de alerta",
        body: "Restricción de alimentos, conteo obsesivo de calorías, atracones, conductas compensatorias (vómitos, ejercicio excesivo, laxantes), aislamiento social en torno a las comidas, distorsión de la imagen corporal y cambios bruscos de peso. Identificarlas a tiempo mejora el pronóstico.",
      },
      {
        title: "El proceso de recuperación",
        body: "La recuperación es un camino no lineal: habrá días buenos y otros más difíciles. Implica recuperar peso si es necesario, normalizar la alimentación, trabajar pensamientos y emociones asociados, y reconstruir la relación con tu cuerpo. La constancia y el acompañamiento profesional son claves.",
      },
      {
        title: "Mitos frecuentes",
        body: "Mito: «Los TCA son una elección». Realidad: son enfermedades mentales serias. Mito: «Solo afectan a mujeres jóvenes». Realidad: afectan a personas de cualquier edad y género. Mito: «Si comes ya estás recuperada». Realidad: la recuperación física es solo una parte.",
      },
    ],
  },
  {
    category: "Ansiedad",
    items: [
      {
        title: "Entender la ansiedad",
        body: "La ansiedad es una respuesta natural del cuerpo ante situaciones percibidas como amenazantes. Se vuelve un problema cuando es desproporcionada, persistente o interfiere con tu vida. Síntomas: taquicardia, opresión en el pecho, pensamientos rumiantes, tensión muscular e hiperventilación.",
      },
      {
        title: "Técnica de respiración 4-7-8",
        body: "Inhala por la nariz durante 4 segundos. Mantén el aire 7 segundos. Exhala lentamente por la boca durante 8 segundos. Repite 4 ciclos. Activa el sistema parasimpático y reduce la respuesta de lucha/huida.",
      },
      {
        title: "Técnica de grounding 5-4-3-2-1",
        body: "Cuando sientas ansiedad intensa, identifica: 5 cosas que ves, 4 que puedes tocar, 3 que oyes, 2 que hueles y 1 que saboreas. Te ancla al presente y reduce los pensamientos catastróficos.",
      },
      {
        title: "Ansiedad en torno a las comidas",
        body: "Es común sentir ansiedad antes, durante o después de comer en el proceso de recuperación. No significa que estés haciendo algo mal: indica que tu mente está procesando un cambio importante. Apóyate en tu equipo, usa técnicas de respiración y registra cómo te sientes.",
      },
    ],
  },
];

const EducationalContent = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen pb-20 px-5 pt-6 bg-gradient-to-b from-background to-muted/30">
    <div className="flex items-center gap-3 mb-5">
      <button onClick={onBack} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
        <ArrowLeft className="w-4 h-4 text-foreground" />
      </button>
      <h1 className="text-xl font-bold text-foreground">Contenido educativo</h1>
    </div>

    {articles.map((section) => (
      <div key={section.category} className="mb-5">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 px-1">
          {section.category}
        </h2>
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm px-4">
          <Accordion type="single" collapsible>
            {section.items.map((item, idx) => (
              <AccordionItem key={item.title} value={`${section.category}-${idx}`} className="border-border/40 last:border-0">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline text-left">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    ))}

    <div className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
      <p className="text-xs text-foreground/80 leading-relaxed">
        <span className="font-semibold">Importante:</span> esta información es divulgativa y no sustituye el criterio de tu equipo médico. Ante cualquier duda consulta con tu profesional de referencia.
      </p>
    </div>
  </div>
);

export default EducationalContent;
