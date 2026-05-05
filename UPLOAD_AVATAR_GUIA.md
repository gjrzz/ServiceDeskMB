# 📸 Guia de Upload de Avatar

## ✅ O que foi implementado

1. ✅ **Serviço de Upload** (`src/services/upload.service.ts`)
   - Upload de arquivos
   - Upload de avatar (base64)
   - Redimensionamento automático
   - Validação de tipo e tamanho

2. ✅ **Componente de Upload** (`src/components/AvatarUpload.tsx`)
   - Interface visual para upload
   - Preview da imagem
   - Loading state
   - Tratamento de erros

3. ✅ **Backend já configurado**
   - Rota `/api/upload/avatar` funcionando
   - Suporta base64
   - Salva em `./uploads/`

---

## 🚀 Como Usar

### **1. Importar o componente**

```typescript
import { AvatarUpload } from '../components/AvatarUpload';
```

### **2. Usar no formulário de usuário**

```typescript
<AvatarUpload
  currentAvatarUrl={usuario.avatarUrl}
  currentAvatar={usuario.avatar} // Iniciais (ex: "GJ")
  onUploadSuccess={(avatarUrl) => {
    // Atualizar usuário com a nova URL
    editarUsuario(usuario.id, { avatarUrl });
  }}
  onUploadError={(error) => {
    // Mostrar mensagem de erro
    showToast(error, 'error');
  }}
/>
```

---

## 📋 Exemplo Completo

### **Editar Perfil do Usuário**

```typescript
const EditarPerfilModal = ({ usuario, onClose, onSave }) => {
  const [avatarUrl, setAvatarUrl] = useState(usuario.avatarUrl);

  const handleSave = () => {
    onSave({
      ...usuario,
      avatarUrl,
    });
    onClose();
  };

  return (
    <div className="modal">
      <h2>Editar Perfil</h2>
      
      {/* Upload de Avatar */}
      <AvatarUpload
        currentAvatarUrl={avatarUrl}
        currentAvatar={usuario.avatar}
        onUploadSuccess={(url) => setAvatarUrl(url)}
        onUploadError={(error) => alert(error)}
      />

      {/* Outros campos do formulário */}
      <input type="text" value={usuario.nome} ... />
      
      <button onClick={handleSave}>Salvar</button>
    </div>
  );
};
```

---

## 🔧 Integração com AuthProvider

O `AuthProvider` já suporta `avatarUrl`. Quando você faz upload:

1. **Upload da imagem** → Retorna URL (ex: `/uploads/avatar-123.jpg`)
2. **Atualizar usuário** → `editarUsuario(id, { avatarUrl })`
3. **Backend salva** → Campo `avatarUrl` no banco
4. **Frontend exibe** → `${API_URL}${usuario.avatarUrl}`

---

## 🎨 Como Exibir Avatar

### **Componente Avatar Simples**

```typescript
const Avatar = ({ usuario, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  if (usuario.avatarUrl) {
    return (
      <img
        src={`${API_URL}${usuario.avatarUrl}`}
        alt={usuario.nome}
        className={`${sizes[size]} rounded-full object-cover`}
        onError={(e) => {
          // Fallback para iniciais
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-accent-primary/20 text-accent-primary font-semibold flex items-center justify-center`}>
      {usuario.avatar}
    </div>
  );
};
```

---

## 📁 Estrutura de Arquivos

```
uploads/
├── avatar-cmorsb90d00006x8xwh39sju1-1234567890.jpg
├── avatar-cmorsb90d00006x8xwh39sju1-1234567891.png
└── ...
```

**Formato do nome:**
- `avatar-{userId}-{timestamp}.{ext}`

---

## 🔒 Segurança

### **Validações Implementadas:**

1. ✅ **Tipo de arquivo** - Apenas imagens (JPG, PNG, GIF)
2. ✅ **Tamanho** - Máximo 10MB (antes do redimensionamento)
3. ✅ **Redimensionamento** - Automático para 400x400px
4. ✅ **Autenticação** - Requer token JWT
5. ✅ **Nome único** - Evita sobrescrever arquivos

---

## 🐛 Tratamento de Erros

### **Erros Comuns:**

1. **"O arquivo deve ser uma imagem"**
   - Usuário tentou enviar PDF, DOC, etc.
   - Solução: Aceitar apenas imagens

2. **"Imagem muito grande (máximo 10MB)"**
   - Arquivo original > 10MB
   - Solução: Reduzir tamanho antes de enviar

3. **"Erro ao fazer upload"**
   - Problema de rede ou servidor
   - Solução: Tentar novamente

4. **Imagem não carrega**
   - URL inválida ou arquivo deletado
   - Solução: Fallback para iniciais

---

## 🎯 Próximos Passos

### **Para integrar no App.tsx:**

1. **Encontrar o modal/formulário de edição de usuário**
2. **Adicionar o componente `<AvatarUpload />`**
3. **Conectar com `editarUsuario()`**
4. **Testar upload**

### **Onde adicionar:**

Procure por:
- Modal de "Editar Perfil"
- Modal de "Criar Usuário"
- Página de configurações do usuário

---

## 🧪 Como Testar

### **1. Testar upload isoladamente**

Crie uma página de teste:

```typescript
import { AvatarUpload } from './components/AvatarUpload';

function TestUpload() {
  return (
    <div className="p-8">
      <h1>Teste de Upload</h1>
      <AvatarUpload
        currentAvatar="TS"
        onUploadSuccess={(url) => console.log('Upload OK:', url)}
        onUploadError={(error) => console.error('Erro:', error)}
      />
    </div>
  );
}
```

### **2. Verificar no Prisma Studio**

```bash
cd backend
npx prisma studio
```

Vá em `usuarios` e veja o campo `avatarUrl`.

### **3. Verificar arquivos salvos**

```bash
ls backend/uploads/
```

Deve mostrar os arquivos de avatar.

---

## 📊 Fluxo Completo

```
1. Usuário clica em "Escolher foto"
   ↓
2. Seleciona imagem do computador
   ↓
3. Frontend valida tipo e tamanho
   ↓
4. Frontend redimensiona para 400x400px
   ↓
5. Frontend converte para base64
   ↓
6. Frontend envia POST /api/upload/avatar
   ↓
7. Backend valida e salva em ./uploads/
   ↓
8. Backend retorna { avatarUrl: "/uploads/avatar-xxx.jpg" }
   ↓
9. Frontend chama editarUsuario({ avatarUrl })
   ↓
10. Backend atualiza campo avatarUrl no banco
   ↓
11. Frontend exibe nova foto
```

---

**Pronto para integrar!** 🎉

Quer que eu encontre onde adicionar o componente no App.tsx?
