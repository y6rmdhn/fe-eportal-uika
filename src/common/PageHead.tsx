interface PropTypes {
  title?: string;
}

export default function PageHead({ title = "E Portal UIKA" }: PropTypes) {
  return (
    <div>
      <head>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/img/icon/logo.png" type="image/x-icon" />
      </head>
    </div>
  );
}
