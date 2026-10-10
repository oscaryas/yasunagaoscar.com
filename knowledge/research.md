# Research

## Sycophancy research at Jinesis AI Lab
Since January 2026 Oscar has been an AI Safety Researcher at Jinesis AI Lab, working with Zhijing Jin, Terry Jingchen Zhang, and Florent Draye. He is building a sycophancy benchmark framework grounded in social psychology: he built the trigger taxonomy from a literature review, generated the social-pressure triggers, adapted the no-ground-truth dataset, and validated the generations. The paper "SuperSycophantic: Stress-Testing Frontier Models from Single- to Multi-Turn Sycophancy" was accepted as a poster at NeurIPS 2026. Code and benchmark: github.com/AI4Collaboration/SuperSycophantic.

## SycoScope
SycoScope tests whether the different definitions of sycophancy used across datasets correspond to genuinely different sycophancy types in activation space, using probing, steering, and sparse autoencoders. Oscar trained probes on each attention head output for the Gemma 3, Qwen 3, and Llama 3.1 model families using stratified 5-fold cross-validation, with the highest accuracy of 90% at middle-to-late layers. He is also developing an interpretability agent that runs probing, SAE, and steering experiments end to end. The project also involves LoRA fine-tuning on Qwen2.5-7B. Code is at github.com/oscaryas/sycoscope.

## Concept cones and propositional truth
From March to July 2025 Oscar did AI safety research with Cole Blondin and Vasu Sharma, extending the concept cone framework to propositional truth. The work showed that Qwen2.5-14B and Gemma2-9B causally encode at least five orthogonal vectors representing truth, with a 100% answer-switch rate, and used PCA of residual stream activations to show truth is linearly separable. The paper "From Directions to Cones: Exploring Multidimensional Representations of Propositional Facts" was accepted at the ACL Student Research Workshop 2025.

## Jacobians and generalization
Since April 2026 Oscar has been in a Directed Reading Program on AI generalization with Haoming Meng, reading about neural collapse, inductive biases, grokking, and lazy versus feature-learning regimes. He is investigating the eigendecomposition and non-normality of cross-token and per-token Jacobians at each layer, and using non-normality to measure how much SVD-based and eigenvalue-based metrics disagree.

## Climate physics and satellite data
From October 2025 to April 2026 Oscar did climate physics AI research with Mickell Als and Prof. Steve Easterbrook. He built a pipeline that reorganized eight years of GOES Advanced Baseline Imager Full Disk observations into Zarr data cubes: 110,688 hourly samples, about 33 TB, across 16 spectral bands. His QA tests found that 6.7% of temporal scans were corrupted. The paper "GOES-ABI Data Cube: Eight Years of Unified Geostationary Satellite Observations" was accepted at Climate Informatics 2026.

## RLViz
Since December 2025 Oscar has worked on RL pedagogy with Prof. Chandra Gummaluru, building RLViz, a web-based MDP visualizer in p5.js that animates value iteration and the Bellman equation for the ROB311 reinforcement learning course. The paper "RLViz: An Interactive Visualization to Aid Student Understanding of Bellman Equations" is in preparation.

## Geometry of Sycophancy at UTMIST
From September 2025 to April 2026 Oscar was a Research Manager at UTMIST, leading ten undergraduates on the Geometry of Sycophancy project. They found the dataset from "Towards Understanding Sycophancy in Language Models" does not show clustering, and steering worked in-domain but gave mixed results across domains. Oscar presented the work at CUCAI 2026 and UTMIST DevCon 2026.

## Skills
PyTorch, NNsight, TransformerLens, Unsloth, TRL, Tinker, Weights & Biases, and HPC/SLURM.
