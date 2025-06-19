{
  description = "Mouseless Aim project flake";

  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05"; };

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.x86_64-linux.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [ http-server ];

        shellHook = ''
          echo "Mouseless Aim Nix environment activated."
        '';
      };
    };
}
