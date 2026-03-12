import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const topologies = {
  mean: path.join(__dirname, 'topologies/mean.gg'),
  outliers: path.join(__dirname, 'topologies/outliers.gg'),
};
