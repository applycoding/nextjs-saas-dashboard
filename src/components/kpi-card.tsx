import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  detail,
  measured,
}: {
  label: string;
  value: string;
  detail: string;
  measured: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{measured ? value : "—"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
