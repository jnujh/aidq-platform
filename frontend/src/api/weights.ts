import client from './client';

export interface WeightRecommendation {
  weights: Record<string, number>;
  reasoning: string;
}

export const weightsApi = {
  recommend(purpose: string) {
    return client.post<{ success: boolean; data: WeightRecommendation }>(
      '/api/weights/recommend',
      { purpose }
    );
  },
};
