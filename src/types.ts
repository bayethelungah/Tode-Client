export interface DependencyNode {
    name: string;
    version: string;
    dependencies: DependencyNode[] | null;
}