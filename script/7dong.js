var body = $response.body.replace(
  /"menberType":"NOT_MENBER"/g,
  '"menberType":"VIP_MENBER"'
);
$done({ body });
