#![deny(clippy::all)]
use std::time::Duration;

use napi::threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode};
use souvlaki::{MediaPosition, PlatformConfig};

#[macro_use]
extern crate napi_derive;

#[napi(js_name = "MediaControl")]
pub struct MediaControl {
  controls: souvlaki::MediaControls,
}

#[napi(object)]
pub struct MediaMetadata {
  pub title: String,
  pub artist: String,
  pub album: String,
  pub duration: u32,
}

#[napi]
impl MediaControl {
  #[napi(constructor)]
  pub fn new() -> Self {
    #[cfg(not(target_os = "windows"))]
    let hwnd = None;

    #[cfg(target_os = "windows")]
    let hwnd = {
      use raw_window_handle::windows::WindowsHandle;

      let handle: WindowsHandle = unimplemented!();
      Some(handle.hwnd)
    };

    let config = PlatformConfig {
      dbus_name: "astray",
      display_name: "Astray",
      hwnd,
    };

    let controls = souvlaki::MediaControls::new(config).unwrap();

    Self { controls }
  }

  #[napi]
  pub fn set_metadata(&mut self, metadata: MediaMetadata) {
    let metadata = souvlaki::MediaMetadata {
      title: Some(&metadata.title),
      artist: Some(&metadata.artist),
      album: Some(&metadata.album),
      duration: Some(Duration::from_secs(metadata.duration as u64)),
      cover_url: None,
    };

    self.controls.set_metadata(metadata).unwrap();
  }

  #[napi(
    ts_args_type = "callback: (event: 'play' | 'pause' | 'next' | 'previous' | 'stop' | 'toggle') => void"
  )]
  pub fn attach(&mut self, callback: napi::JsFunction) -> napi::Result<()> {
    let tsfn: ThreadsafeFunction<&str, ErrorStrategy::Fatal> = callback
      .create_threadsafe_function(0, |ctx| ctx.env.create_string(ctx.value).map(|v| vec![v]))?;

    let callback = move |event: souvlaki::MediaControlEvent| {
      let event = match event {
        souvlaki::MediaControlEvent::Play => "play",
        souvlaki::MediaControlEvent::Pause => "pause",
        souvlaki::MediaControlEvent::Next => "next",
        souvlaki::MediaControlEvent::Previous => "previous",
        souvlaki::MediaControlEvent::Stop => "stop",
        souvlaki::MediaControlEvent::Toggle => "toggle",
        _ => return,
      };

      tsfn.call(event, ThreadsafeFunctionCallMode::Blocking);

      return;
    };

    self.controls.attach(callback).unwrap();

    Ok(())
  }

  #[napi(ts_args_type = "playing_state: 'playing' | 'paused' | 'stopped', progress?: number")]
  pub fn set_state(&mut self, playing_state: String, progress: Option<u32>) {
    let progress = progress.unwrap_or(0);

    let state = match playing_state.as_str() {
      "playing" => souvlaki::MediaPlayback::Playing {
        progress: Some(MediaPosition(Duration::from_secs(progress as u64))),
      },
      "paused" => souvlaki::MediaPlayback::Paused {
        progress: Some(MediaPosition(Duration::from_secs(progress as u64))),
      },
      "stopped" => souvlaki::MediaPlayback::Stopped,
      _ => return,
    };

    self.controls.set_playback(state).unwrap();
  }
}
