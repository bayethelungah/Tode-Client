export interface DependencyNode extends TodeResponseMessageBody {
    name: string;
    version: string;
    status: string;
    dependencies: { [key: string]: DependencyNode } | undefined;
}


export enum StatusColor {
    ok = "bg-green-300",
    outdated = "bg-yellow-300",
    vulnerable = "bg-red-300",
    default = "bg-blue-300"
}


export interface TodeRequestMessage {
    body: string;
}

export interface TodeResponseMessage {
    body: TodeResponseMessageBody | null;
    errorMessage: string | null;   
}


export interface TodeResponseMessageBody {
     
}


