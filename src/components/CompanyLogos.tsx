import { Badge } from "@/components/ui/badge";

export const CompanyLogos = () => {
  const companies = [
    { name: "TechCorp", employees: "5,000+" },
    { name: "StartupXYZ", employees: "500+" },
    { name: "Enterprise Inc", employees: "10,000+" },
    { name: "Innovation Labs", employees: "2,000+" },
    { name: "Agile Solutions", employees: "1,500+" },
    { name: "Digital Dynamics", employees: "3,000+" }
  ];

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground font-medium">
        BUILT FOR AGILE TEAMS
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
        {companies.map((company, index) => (
          <div 
            key={index}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="font-bold text-lg text-center bg-gradient-primary bg-clip-text text-transparent">
              {company.name}
            </div>
            <Badge variant="secondary" className="text-xs">
              {company.employees} employees
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
