import numpy as np

class PortfolioOptimizer:
    def __init__(self, gnn_model, xgb_model, costs):
        self.gnn = gnn_model
        self.xgb = xgb_model
        self.costs = costs # { 'Cool Roof': 350000, ... }

    def run_optimization(self, df, budget, alpha):
        # 1. Calculate Multi-View Score
        # S = (1-alpha) * (GNN_Risk * Delta_T) + alpha * Social_Vulnerability
        df['priority_score'] = (1 - alpha) * (df['gnn_risk'] * df['predicted_delta_t']) + \
                               (alpha * df['vulnerability_index'])
        
        # 2. Sort by highest priority
        ranked_blocks = df.sort_values('priority_score', ascending=False)
        
        portfolio = []
        remaining_budget = budget
        
        for _, block in ranked_blocks.iterrows():
            best_measure = block['suggested_measure']
            cost = self.costs.get(best_measure, 0)
            
            if cost <= remaining_budget:
                portfolio.append({
                    "block_id": block['block_id'],
                    "measure": best_measure,
                    "cost": cost,
                    "new_temp": block['LST_Dynamic'] - block['predicted_delta_t']
                })
                remaining_budget -= cost
                
            if remaining_budget < min(self.costs.values()):
                break # Budget exhausted
                
        return portfolio