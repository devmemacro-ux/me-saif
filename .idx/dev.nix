# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];
  env = {};
  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["sh" "-c" "cd server && npm run dev & cd client && npm run dev -- --port $PORT"];
          manager = "web";
          env = { PORT = "$PORT"; };
        };
      };
    };
    workspace = {
      onCreate = {
        install = "cd server && npm install && cd ../client && npm install && cd ../server && npm run seed";
        default.openFiles = [ "README.md" ];
      };
      onStart = {};
    };
  };
}
