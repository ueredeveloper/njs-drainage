{ pkgs }: {
	deps = [
		pkgs.nodejs-17_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.yarn
        pkgs.replitPackages.jest
	];
}