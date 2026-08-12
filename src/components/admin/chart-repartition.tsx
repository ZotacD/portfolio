"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  published: {
    label: "Publiés",
    color: "var(--chart-1)",
  },
  draft: {
    label: "Brouillons",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartRepartition({
  data,
}: {
  data: { name: "published" | "draft"; value: number }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[220px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={4}
        >
          <Cell key="published" fill="var(--color-published)" />
          <Cell key="draft" fill="var(--color-draft)" />
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="flex-wrap gap-2"
        />
      </PieChart>
    </ChartContainer>
  );
}
