import path from 'path';

export const gnarEngineCliConfig = {

    /**
     * The path the Gnar Engine service core should be found in the service containers
     */
    corePath: '/usr/gnar_engine/app/node_modules/@gnar-engine/core'

}

export const directories = {
    scaffolderServiceTemplates: path.join(import.meta.dirname, '../templates/service'),
    scaffolderEntityTemplates: path.join(import.meta.dirname, '../templates/entity'),
    bootstrap: path.join(import.meta.dirname, '../bootstrap'),
    provisioner: path.join(import.meta.dirname, './provisioner')
};
