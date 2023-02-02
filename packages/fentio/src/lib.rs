#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use rodio::{Decoder, OutputStream, Source};
use std::collections::HashMap;
use std::fs::File;
use std::sync::Mutex;
use std::time::Duration;
use uuid::Uuid;

use once_cell::sync::Lazy;

static PLAY_MAP: Lazy<Mutex<HashMap<Uuid, bool>>> = Lazy::new(|| Mutex::new(HashMap::new()));

#[napi]
fn play(path: String, start_at_seconds: f64) -> String {
  let id = Uuid::new_v4();

  std::thread::spawn(move || {
    let file = File::open(path).unwrap();
    let source = Decoder::new(file).unwrap();
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    PLAY_MAP.lock().unwrap().insert(id, true);

    let source = source.skip_duration(Duration::from_secs_f64(start_at_seconds));

    stream_handle.play_raw(source.convert_samples()).unwrap();

    loop {
      let map = PLAY_MAP.lock().unwrap();
      let exists = map.get(&id);

      if exists.is_none() {
        break;
      }

      let exists = *exists.unwrap();

      if !exists {
        break;
      }

      continue;
    }
  });

  return id.to_string();
}

#[napi]
fn stop(id: String) {
  let id = Uuid::parse_str(&id).unwrap();
  PLAY_MAP.lock().unwrap().remove(&id);
  return;
}
