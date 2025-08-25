import z from 'zod'

export const TrainRequestSchema = z.object({
  station: z.string(),
  sessionId: z.string(),
})

export type TrainSignals = z.infer<typeof TrainRequestSchema>

export const KvSessionSchema = z.object({
  station: z.string(),
})

export type KvSession = z.infer<typeof KvSessionSchema>
