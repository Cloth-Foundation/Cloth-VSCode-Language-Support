import * as vscode from "vscode";
import * as path from "path";

type ClothObjectKind = "class" | "struct" | "enum" | "interface" | "trait";
type ClothFileExtension = ".co" | ".cl";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        // Object file commands (.co)
        vscode.commands.registerCommand(
            "cloth.newClass",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "class", ".co", false);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newStruct",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "struct", ".co", false);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newEnum",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "enum", ".co", false);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newInterface",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "interface", ".co", false);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newTrait",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "trait", ".co", false);
            },
        ),

        // Library file commands (.cl)
        vscode.commands.registerCommand(
            "cloth.newClassLib",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "class", ".cl", true);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newStructLib",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "struct", ".cl", true);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newEnumLib",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "enum", ".cl", true);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newInterfaceLib",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "interface", ".cl", true);
            },
        ),

        vscode.commands.registerCommand(
            "cloth.newTraitLib",
            async (uri?: vscode.Uri) => {
                await createClothObject(uri, "trait", ".cl", true);
            },
        ),
    );
}

async function createClothObject(
    uri: vscode.Uri | undefined,
    kind: ClothObjectKind,
    extension: ClothFileExtension,
    libraryFile: boolean
) {
    const folderUri = await resolveTargetFolder(uri);

    if (!folderUri) {
        vscode.window.showErrorMessage("No target folder selected.");
        return;
    }

    const rawName = await vscode.window.showInputBox({
        title: `New Cloth ${kind}`,
        prompt: `Enter the ${kind} name`,
        placeHolder:
            kind === "class"
                ? "MyClass"
                : kind === "struct"
                    ? "MyStruct"
                    : kind === "enum"
                        ? "MyEnum"
                        : kind === "interface"
                            ? "MyInterface"
                            : "MyTrait",
        validateInput(value) {
            if (!value.trim()) {
                return "Name cannot be empty.";
            }

            if (!/^[A-Z_][A-Za-z0-9_]*$/.test(value.trim())) {
                return "Use a valid Cloth type name, for example MyClass.";
            }

            return undefined;
        },
    });

    if (!rawName) {
        return;
    }

    const typeName = stripClothExtension(rawName.trim());
    const fileUri = vscode.Uri.joinPath(folderUri, `${typeName}${extension}`);

    try {
        await vscode.workspace.fs.stat(fileUri);
        vscode.window.showErrorMessage(`${typeName}${extension} already exists.`);
        return;
    } catch {
        // File does not exist, which is what we want.
    }

    const moduleName = resolveModuleName(fileUri);
    const content = generateClothObject(typeName, kind, libraryFile, moduleName);
    const encoder = new TextEncoder();

    await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));

    const document = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(document);
}

async function resolveTargetFolder(
    uri: vscode.Uri | undefined,
): Promise<vscode.Uri | undefined> {
    if (uri) {
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type === vscode.FileType.Directory) {
            return uri;
        }

        return vscode.Uri.file(path.dirname(uri.fsPath));
    }

    const folders = vscode.workspace.workspaceFolders;

    if (!folders || folders.length === 0) {
        return undefined;
    }

    return folders[0].uri;
}

function stripClothExtension(name: string): string {
    return name.endsWith(".co") ? name.slice(0, -3) : name.endsWith(".cl") ? name.slice(0, -3) : name;
}

function resolveModuleName(fileUri: vscode.Uri): string | undefined {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);

    if (!workspaceFolder) {
        return undefined;
    }

    const srcPath = path.join(workspaceFolder.uri.fsPath, "src");
    const directoryPath = path.dirname(fileUri.fsPath);
    const relativeDirectory = path.relative(srcPath, directoryPath);

    if (
        !relativeDirectory ||
        relativeDirectory === "." ||
        relativeDirectory.startsWith("..")
    ) {
        return undefined;
    }

    return relativeDirectory.split(path.sep).join(".");
}

function generateClothObject(
    name: string,
    kind: ClothObjectKind,
    libraryFile: boolean,
    moduleName?: string,
): string {
    const moduleDeclaration = moduleName ? `module ${moduleName};\n\n` : "";
    const traitLibraryDirective = libraryFile ? "#Trait Library\n" : "";

    switch (kind) {
            case "class":
                return `${moduleDeclaration}${traitLibraryDirective}public class ${name}() {\n\n}`;
            case "struct":
                return `${moduleDeclaration}${traitLibraryDirective}public struct ${name} {\n\n}`;
            case "enum":
                return `${moduleDeclaration}${traitLibraryDirective}public enum ${name} {\n\n}`;
            case "interface":
                return `${moduleDeclaration}${traitLibraryDirective}public interface ${name} {\n\n}`;
            case "trait":
                return `${moduleDeclaration}${traitLibraryDirective}public trait ${name} {\n\n}`;
        }
}

export function deactivate() { }
