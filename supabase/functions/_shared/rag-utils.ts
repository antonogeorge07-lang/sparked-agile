/**
 * RAG Utilities - Shared embedding generation and retrieval helpers
 * 
 * Uses a 32-dimensional "semantic fingerprint" approach:
 * Instead of generic embeddings (which require a dedicated embeddings API),
 * we score content across 32 PM-specific dimensions using the AI gateway.
 * This creates domain-optimised vectors for project management content.
 */

const PM_DIMENSIONS = [
  'sprint_planning', 'backlog_management', 'team_velocity', 'technical_debt',
  'code_quality', 'testing_qa', 'deployment_release', 'architecture',
  'team_morale', 'communication', 'blockers_impediments', 'dependencies',
  'risk_management', 'scope_management', 'estimation_accuracy', 'capacity_planning',
  'stakeholder_alignment', 'user_feedback', 'process_improvement', 'automation',
  'documentation', 'onboarding', 'security_compliance', 'performance',
  'scalability', 'ux_design', 'data_quality', 'integration',
  'monitoring_observability', 'incident_response', 'knowledge_sharing', 'innovation'
];

export async function generateEmbedding(
  content: string,
  apiKey: string
): Promise<number[]> {
  const truncatedContent = content.slice(0, 4000); // Limit input size

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        {
          role: 'system',
          content: `You are a semantic analysis engine for agile project management content. You must score content across exactly 32 dimensions.`
        },
        {
          role: 'user',
          content: `Score the following content on each of these 32 project management dimensions from -1.0 to 1.0 (0 = not relevant, positive = directly relevant, negative = contrasting/opposite). Be precise.\n\nDimensions: ${PM_DIMENSIONS.join(', ')}\n\nContent:\n${truncatedContent}`
        }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'store_semantic_vector',
          description: 'Store the 32-dimensional semantic fingerprint vector',
          parameters: {
            type: 'object',
            properties: {
              vector: {
                type: 'array',
                items: { type: 'number' },
                minItems: 32,
                maxItems: 32,
                description: `Array of exactly 32 float values (-1.0 to 1.0), one per dimension in order: ${PM_DIMENSIONS.join(', ')}`
              }
            },
            required: ['vector'],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'store_semantic_vector' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Embedding generation failed:', response.status, errorText);
    throw new Error(`Embedding generation failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    throw new Error('No tool call response from AI');
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const vector = parsed.vector;

  if (!Array.isArray(vector) || vector.length !== 32) {
    throw new Error(`Invalid vector dimensions: expected 32, got ${vector?.length}`);
  }

  // Clamp values to [-1, 1] range
  return vector.map((v: number) => Math.max(-1, Math.min(1, Number(v) || 0)));
}

/**
 * Format vector for PostgreSQL pgvector insertion
 */
export function vectorToSql(vector: number[]): string {
  return `[${vector.join(',')}]`;
}

export { PM_DIMENSIONS };
