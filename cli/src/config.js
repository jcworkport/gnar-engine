import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const gnarEngineCliConfig = {

    /**
     * The path the Gnar Engine service core should be found in the service containers
     */
    corePath: '/usr/gnar_engine/app/node_modules/@gnar-engine/core',
    coreDevPath: path.join(__dirname, '../../core'),

}

export const directories = {
    scaffolderServiceTemplates: path.join(import.meta.dirname, '../templates/service'),
    scaffolderEntityTemplates: path.join(import.meta.dirname, '../templates/entity'),
    bootstrap: path.join(import.meta.dirname, '../bootstrap'),
    provisioner: path.join(import.meta.dirname, './provisioner')
};
