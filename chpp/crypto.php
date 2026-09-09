<?php

define('COOKIE_PREFIX', 'v1:');

function encrypt_cookie(string $plaintext): string
{
    $iv = random_bytes(16);
    $ciphertext = openssl_encrypt($plaintext, 'aes-256-cbc', COOKIE_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv);
    $hmac = hash_hmac('sha256', $iv . $ciphertext, COOKIE_HMAC_KEY, true);
    return COOKIE_PREFIX . base64_encode($iv . $ciphertext . $hmac);
}

/**
 * Whether the given value uses the encrypted cookie format.
 */
function is_encrypted_cookie(string $encoded): bool
{
    return strpos($encoded, COOKIE_PREFIX) === 0;
}

/**
 * @return string|false
 */
function decrypt_cookie(string $encoded)
{
    if (!is_encrypted_cookie($encoded)) {
        return false;
    }

    $data = base64_decode(substr($encoded, strlen(COOKIE_PREFIX)), true);
    if ($data === false || strlen($data) < 49) {
        return false;
    }

    $iv = substr($data, 0, 16);
    $hmac = substr($data, -32);
    $ciphertext = substr($data, 16, -32);

    $expectedHmac = hash_hmac('sha256', $iv . $ciphertext, COOKIE_HMAC_KEY, true);
    if (!hash_equals($expectedHmac, $hmac)) {
        return false;
    }

    $plaintext = openssl_decrypt($ciphertext, 'aes-256-cbc', COOKIE_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv);
    return $plaintext === false ? false : $plaintext;
}
