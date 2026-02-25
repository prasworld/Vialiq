import { Tree, names, formatFiles } from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';

interface Schema {
  name: string;
  style?: string;
  routing?: boolean;
  tags?: string;
}

export default async function (tree: Tree, schema: Schema) {
  const appName = names(schema.name).fileName;
  const directory = `apps/${appName}`;
  const options: any = {
    ...schema,
    directory,
    name: appName,
  };

  const task = await applicationGenerator(tree, options);
  await formatFiles(tree);
  return task;
}
