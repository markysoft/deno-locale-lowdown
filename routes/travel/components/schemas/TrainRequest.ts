import z from 'zod'

export const TrainRequestSchema = z.object({
  station: z.string(),
  sessionId: z.string(),
})

export type TrainSignals = z.infer<typeof TrainRequestSchema>
