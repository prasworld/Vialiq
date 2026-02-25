import { Tree, names, formatFiles } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

interface Schema {
  name: string;
  bundler?: string;
  linter?: string;
  unitTestRunner?: string;
  tags?: string;
  publishable?: boolean;
  importPath?: string;
}

export default async function (tree: Tree, schema: Schema) {
  const libName = names(schema.name).fileName;
  const directory = `libs/${libName}`;
  const options: any = {
    ...schema,
    directory,
    name: libName,
  };

  const task = await libraryGenerator(tree, options);
  await formatFiles(tree);
  return task;
}
