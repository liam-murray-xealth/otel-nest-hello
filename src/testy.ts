function sleep<T>(ms: number, result?: T): Promise<T | undefined> {
  return new Promise(resolve => setTimeout(() => resolve(result), ms))
}

function doSleep(): Promise<void> {
  return sleep(1000)
}

type Callback = () => void

function callme(cb: Callback) {
  cb()
}

function wrap(f: () => Promise<unknown>) {
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f()
  }
}

callme(doSleep)

//callme(wrap(doSleep))

// eslint@typescript-eslint/no-floating-promises
