# BTMCode — Gmail API ve spam koruması kurulum rehberi

Bu rehber, BTMCode iletişim formunun doğrudan `devcloudpy@gmail.com` hesabına Gmail API ile e-posta göndermesini ve otomatik spam başvurularını Cloudflare Turnstile ile filtrelemesini açıklar.

> **Güvenlik:** OAuth anahtarları, Gmail yenileme belirteci ve Turnstile Secret Key yalnızca Vercel Environment Variables içinde **Sensitive** olarak saklanmalıdır. Bu bilgileri GitHub'a, web sayfasına veya sohbet mesajına koymayın.

## 1. Gmail API'yi etkinleştirin

1. [Google Cloud Console](https://console.cloud.google.com/) adresini açın.
2. Yeni bir proje oluşturun veya BTMCode için ayırdığınız projeyi seçin.
3. **APIs & Services → Library** bölümüne gidin.
4. **Gmail API** aratıp **Enable** düğmesine basın.
5. **Google Auth Platform → Branding** bölümünde uygulama adını BTMCode, destek e-postasını `devcloudpy@gmail.com` olarak girin.
6. **Audience** bölümünde kişisel Gmail hesabı için **External** kullanıcı türünü seçin. İlk test için `devcloudpy@gmail.com` adresini Test users listesine ekleyin.
7. **Data Access** bölümünde yalnızca şu izni ekleyin:

   `https://www.googleapis.com/auth/gmail.send`

   Gelen kutusunu okuma, silme veya yönetme izni istemiyoruz.

## 2. Google OAuth istemci bilgilerini oluşturun

1. Google Auth Platform → **Clients** → **Create client** bölümünü açın.
2. Application type olarak **Web application** seçin.
3. İsim verin: `BTMCode Contact Form`.
4. Authorized redirect URI listesine şu adresi ekleyin:

   `https://developers.google.com/oauthplayground`

5. Client ID ve Client Secret bilgilerini oluşturun. Gizli değeri herkese açık bir yere kaydetmeyin.

## 3. Gmail yenileme belirtecini alın

1. [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) adresini açın.
2. Sağ üstteki ayarlar simgesinden **Use your own OAuth credentials** seçeneğini açın.
3. Google Cloud'da oluşturduğunuz Client ID ve Client Secret bilgilerini girin.
4. Scope alanına yalnızca şunu yazın:

   `https://www.googleapis.com/auth/gmail.send`

5. **Authorize APIs** ile `devcloudpy@gmail.com` hesabında yetki verin.
6. **Exchange authorization code for tokens** adımını çalıştırın.
7. Dönen yanıttaki `refresh_token` değerini kopyalayın. Bu değer sunucunun oturum açmadan yeni access token almasını sağlar.

### Test modu ve 7 günlük süre

External OAuth uygulaması **Testing** durumunda bırakılırsa Gmail gibi kapsamlar için alınan refresh token 7 gün sonra sona erebilir. Kalıcı üretim kullanımı için uygulamanın yayın durumunu **In production** yapın ve Google'ın hassas kapsam doğrulama koşullarını inceleyin. Doğrulanmamış uygulamalarda Google uyarı ve kullanıcı sınırları uygulayabilir.

## 4. Cloudflare Turnstile ile bot koruması oluşturun

Turnstile, e-posta sağlayıcısı değildir; yalnızca formu otomatik botlardan koruyan doğrulama katmanıdır. Web sitesi Cloudflare DNS arkasında olmak zorunda değildir.

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) hesabınızı açın.
2. Sol menüden **Turnstile** bölümüne gidin.
3. **Add widget** seçeneğine tıklayın.
4. Widget adı: `BTMCode Contact Form`.
5. Widget mode: **Managed** seçin. Bu mod çoğu gerçek kullanıcıda arka planda çalışır; gerekli görürse kısa bir kullanıcı doğrulaması gösterir.
6. Hostname listesine üretim adresini ekleyin:

   `btmcode.vercel.app`

   Preview ortamında test edecekseniz kullandığınız ilgili Vercel hostname'lerini de ekleyin. Gerekmiyorsa geniş wildcard kullanmayın.

7. Widget'ı oluşturun ve iki değeri alın:
   - **Sitekey:** Genel anahtar; web sayfasında bulunabilir.
   - **Secret key:** Gizli anahtar; yalnızca Vercel sunucusunda tutulur.

### Sitekey'i web sitesine ekleyin

GitHub'daki `assets/config.js` dosyasında:

```js
window.BTM_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  gaMeasurementId: "",
  turnstileSiteKey: "CLOUDFLARE_SITEKEY_BURAYA"
};
```

Buraya yalnızca Sitekey girilir. Secret Key kesinlikle buraya yazılmaz.

## 5. Vercel Environment Variables

[Vercel Project Settings → Environment Variables](https://vercel.com/ahmets-projects-5558123d/btmcode/settings/environment-variables) bölümünde aşağıdaki değişkenleri ekleyin.

| Değişken | Değer | Tür |
|---|---|---|
| `CONTACT_TO_EMAIL` | `devcloudpy@gmail.com` | Plain |
| `GMAIL_SENDER_EMAIL` | `devcloudpy@gmail.com` | Plain |
| `GMAIL_CLIENT_ID` | Google OAuth Client ID | Plain |
| `GMAIL_CLIENT_SECRET` | Google OAuth Client Secret | **Sensitive** |
| `GMAIL_REFRESH_TOKEN` | Google OAuth Refresh Token | **Sensitive** |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key | **Sensitive** |

Production ortamını seçin. İhtiyaca göre Preview ve Development hedeflerini de ekleyin. Değerleri kaydettikten sonra yeni production deployment oluşturun.

## 6. Spam koruması nasıl çalışır?

Bir başvuru Gmail'e ulaşmadan önce sunucuda şu kontrollerden geçer:

1. **Honeypot alanı:** Normal ziyaretçiye görünmeyen tuzak alan doldurulmuşsa başvuru sessizce atılır.
2. **Turnstile token doğrulaması:** Her başvuruda Cloudflare Siteverify API çağrılır. Başarısız, süresi dolmuş, tekrar kullanılmış, farklı hostname'e veya farklı action'a ait token reddedilir.
3. **Hostname ve action kontrolü:** Token'ın `btmcode.vercel.app` ve `contact` işlemi için üretildiği doğrulanır.
4. **Hız sınırı:** IP başına ve e-posta başına ek deneme limitleri uygulanır.
5. **Tekrarlanan mesaj kontrolü:** Aynı e-posta ve aynı mesaj 15 dakika içinde yeniden gönderilemez.
6. **İçerik filtresi:** Dört veya daha fazla dış bağlantı içeren mesaj reddedilir.
7. **Gmail aktarımı:** Bu kontroller geçerse mesaj doğrudan Gmail API'ye gönderilir.

Turnstile token'ları 5 dakika geçerlidir ve tek kullanım içindir. Widget'ın tarayıcıda görünmesi tek başına koruma sayılmaz; sunucu doğrulaması zorunludur.

**Limitasyon:** IP/e-posta/tekrar sayaçları Vercel Function örneği içinde tutulur; farklı sunucu örnekleri arasında ortak bir sayaç değildir. Bu nedenle ana bot kapısı Turnstile'ın sunucu doğrulamasıdır. Hiçbir anti-spam sistemi spam'i yüzde 100 engelleme garantisi veremez; hedef otomatik ve kötü niyetli gönderimleri ciddi biçimde azaltırken gerçek müşteri taleplerini korumaktır.

## 7. Yayına alma kontrol listesi

- [ ] Turnstile widget hostname'i `btmcode.vercel.app` için oluşturuldu.
- [ ] Sitekey `assets/config.js` dosyasına eklendi.
- [ ] Secret Key Vercel'de Sensitive olarak kaydedildi.
- [ ] Google OAuth Client ID / Secret / Refresh Token Vercel'e eklendi.
- [ ] Yeni production deployment `READY` durumuna geldi.
- [ ] Gerçek tarayıcıda Turnstile doğrulaması tamamlandı.
- [ ] Test başvurusu `devcloudpy@gmail.com` gelen kutusuna ulaştı.
- [ ] Aynı test mesajını tekrar gönderince duplicate koruması devreye girdi.
- [ ] Widget token'ı olmadan API çağrısı reddedildi.

## Resmî kaynaklar

- [Google Gmail API — sunucu tarafı OAuth](https://developers.google.com/workspace/gmail/api/auth/web-server)
- [Google OAuth — offline access ve refresh token](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Cloudflare Turnstile — kurulum](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Turnstile — sunucu tarafı token doğrulaması](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile Privacy Addendum](https://www.cloudflare.com/turnstile-privacy-policy/)
