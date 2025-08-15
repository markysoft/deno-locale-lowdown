export function ErrorArticle({ message }: { message: string }) {
  return (
    <div id='site-error' class='container'>
      <div class='notification is-danger'>
        <h1 class='title'>Something went wrong</h1>
        <p>{message}</p>
      </div>
    </div>
  )
}
