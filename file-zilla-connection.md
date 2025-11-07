# Conectando via FTPS com FileZilla

Este documento descreve como realizar a conexão com um servidor FTPS usando as credenciais fornecidas pelo Centro de Implantação.

## Pré-requisitos

- FileZilla instalado ([download aqui](https://filezilla-project.org/))
- As seguintes informações fornecidas pelo Centro de Implantação:
  - **FTPS Endpoint**
  - **FTPS Username**
  - **FTPS Password**

## Passos para conectar

1. Abra o **FileZilla**.

2. Vá em **Arquivo** > **Gerenciador de sites** (`Ctrl+S`).

3. Clique em **Novo site** e configure com as informações fornecidas:

   - **Host:** `ftp.seu-endpoint.com`  
   - **Porta:** (opcional, geralmente `21`) - Não usei porta
   - **Usuário:** `seu-username`
   - **Senha:** `sua-senha`

4. Clique em **Conectar**.

# Observações
  ## 06/02/2025
  No último commit, no momento em que enviei para o github o azure atualizou junto, porém estava faltando as senhas do banco da Adasa. Estas senhas não devem ser enviadas junto com os arquivos para o azure, ou seja, o arquivo .env não deve ser enviado. As senhas devem ser adicionadas nas variáveis ambiente do portal azure.