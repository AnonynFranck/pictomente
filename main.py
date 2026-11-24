"""
Kallpa-Play AI — Demo Pygame
Juego de comunicación por pictogramas con inferencia adaptativa.
"""

import sys

import pygame
import pygame.freetype

import arasaac
import tts
from inference import InferenceEngine

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
SCREEN_W, SCREEN_H = 960, 640
FPS = 60
TITLE = "Kallpa-Play AI"

# Paleta de colores
C_BG          = (245, 245, 250)
C_HEADER_BG   = (52,  73,  94)
C_ACCENT      = (41, 182, 246)
C_WHITE       = (255, 255, 255)
C_TEXT_DARK   = (30,  30,  40)
C_TEXT_LIGHT  = (220, 220, 230)
C_SELECTED    = (76, 175,  80)
C_HOVER       = (225, 245, 254)
C_CARD_BG     = (255, 255, 255)
C_CARD_BORDER = (200, 210, 220)
C_BTN_PRIMARY = (41, 182, 246)
C_BTN_HOVER   = (30, 150, 210)
C_BTN_TEXT    = (255, 255, 255)
C_SHADOW      = (180, 190, 200)
C_RESULT_BG   = (232, 245, 233)
C_RESULT_BORDER = (76, 175, 80)

PICTO_SIZE    = (110, 110)
CARD_W        = 145
CARD_H        = 160
CARD_GAP      = 18
CARDS_PER_ROW = 6

MAX_ROUNDS    = 4   # máximo de rondas antes de forzar predicción


# ---------------------------------------------------------------------------
# Utilidades de dibujo
# ---------------------------------------------------------------------------

def draw_rounded_rect(surf, color, rect, radius=12, border=0, border_color=None):
    pygame.draw.rect(surf, color, rect, border_radius=radius)
    if border and border_color:
        pygame.draw.rect(surf, border_color, rect, border, border_radius=radius)


def draw_text_wrapped(surf, text: str, font, color, rect, line_spacing=6):
    """Dibuja texto con saltos de línea respetando el ancho del rect."""
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        w, _ = font.size(test)
        if w <= rect.width and "\n" not in word:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))

    # Manejar \n explícitos
    final_lines = []
    for line in lines:
        for part in line.split("\n"):
            final_lines.append(part)

    y = rect.top
    for line in final_lines:
        if y + font.get_height() > rect.bottom:
            break
        rendered = font.render(line, True, color)
        surf.blit(rendered, (rect.left, y))
        y += font.get_height() + line_spacing


# ---------------------------------------------------------------------------
# Clases de pantalla
# ---------------------------------------------------------------------------

class Screen:
    def handle_event(self, event): pass
    def update(self): pass
    def draw(self, surf): pass


class StartScreen(Screen):
    def __init__(self, on_start):
        self.on_start = on_start
        self.btn_rect = pygame.Rect(SCREEN_W // 2 - 120, 380, 240, 58)
        self.hovered = False

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.btn_rect.collidepoint(event.pos)
        if event.type == pygame.MOUSEBUTTONDOWN and self.hovered:
            tts.speak(tts.PHRASES["start"])
            self.on_start()

    def draw(self, surf):
        surf.fill(C_BG)

        # Header
        header = pygame.Rect(0, 0, SCREEN_W, 100)
        draw_rounded_rect(surf, C_HEADER_BG, header, radius=0)
        title_font = pygame.font.SysFont("sans", 38, bold=True)
        pygame.font.SysFont("sans", 18)
        title_surf = title_font.render(TITLE, True, C_WHITE)
        surf.blit(title_surf, (SCREEN_W // 2 - title_surf.get_width() // 2, 28))

        # Descripción
        desc_font = pygame.font.SysFont("sans", 20)
        lines = [
            "Sistema de comunicación por pictogramas",
            "Selecciona imágenes para expresar lo que deseas.",
            "La IA aprenderá de tus elecciones.",
        ]
        y = 160
        for line in lines:
            s = desc_font.render(line, True, C_TEXT_DARK)
            surf.blit(s, (SCREEN_W // 2 - s.get_width() // 2, y))
            y += 36

        # Ícono decorativo
        pygame.draw.circle(surf, C_ACCENT, (SCREEN_W // 2, 310), 40, 5)
        icon_font = pygame.font.SysFont("sans", 44)
        icon = icon_font.render("🎮", True, C_ACCENT)
        surf.blit(icon, (SCREEN_W // 2 - icon.get_width() // 2,
                         310 - icon.get_height() // 2))

        # Botón
        btn_color = C_BTN_HOVER if self.hovered else C_BTN_PRIMARY
        draw_rounded_rect(surf, btn_color, self.btn_rect, radius=14)
        btn_font = pygame.font.SysFont("sans", 22, bold=True)
        btn_text = btn_font.render("Comenzar", True, C_BTN_TEXT)
        surf.blit(btn_text, (
            self.btn_rect.centerx - btn_text.get_width() // 2,
            self.btn_rect.centery - btn_text.get_height() // 2,
        ))

        # Créditos
        cred_font = pygame.font.SysFont("sans", 13)
        cred = cred_font.render(
            "Pictogramas: ARASAAC — Gobierno de Aragón (CC BY-NC-SA)",
            True, (150, 150, 160)
        )
        surf.blit(cred, (SCREEN_W // 2 - cred.get_width() // 2, SCREEN_H - 30))


class GameScreen(Screen):
    def __init__(self, on_finish):
        self.on_finish = on_finish
        self.engine = InferenceEngine()
        self.selected: set[str] = set()
        self.current_pictos: list[str] = []
        self.cards: list[dict] = []          # {key, rect, image}
        self.btn_confirm = pygame.Rect(SCREEN_W - 220, SCREEN_H - 70, 180, 48)
        self.btn_skip    = pygame.Rect(40, SCREEN_H - 70, 140, 48)
        self.hovered_btn = None
        self.anim: dict[str, float] = {}   # key -> escala actual (1.0 = normal)
        self.font_label  = pygame.font.SysFont("sans", 13, bold=True)
        self.font_header = pygame.font.SysFont("sans", 20, bold=True)
        self.font_sub    = pygame.font.SysFont("sans", 15)
        self._load_round()

    def _load_round(self):
        self.selected = set()
        self.current_pictos = self.engine.get_pictograms_for_round(CARDS_PER_ROW)
        self._build_cards()
        phrase = tts.PHRASES["round_0"] if self.engine.round_num == 0 else tts.PHRASES["round_n"]
        tts.speak(phrase)

    def _build_cards(self):
        self.cards = []
        n = len(self.current_pictos)
        total_w = n * CARD_W + (n - 1) * CARD_GAP
        start_x = (SCREEN_W - total_w) // 2
        y = 190

        for i, key in enumerate(self.current_pictos):
            x = start_x + i * (CARD_W + CARD_GAP)
            rect = pygame.Rect(x, y, CARD_W, CARD_H)
            image = arasaac.get_image(key, PICTO_SIZE)
            self.cards.append({"key": key, "rect": rect, "image": image})

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            pos = event.pos
            self.hovered_btn = None
            if self.btn_confirm.collidepoint(pos):
                self.hovered_btn = "confirm"
            elif self.btn_skip.collidepoint(pos):
                self.hovered_btn = "skip"

        if event.type == pygame.MOUSEBUTTONDOWN:
            pos = event.pos
            # Toggle selección de tarjetas
            for card in self.cards:
                if card["rect"].collidepoint(pos):
                    key = card["key"]
                    if key in self.selected:
                        self.selected.discard(key)
                        self.anim[key] = 1.0
                    else:
                        self.selected.add(key)
                        self.anim[key] = 1.18  # inicia agrandado, se anima hacia 1.0
                        tts.speak(arasaac.get_label(key))
                    return

            # Confirmar selección
            if self.btn_confirm.collidepoint(pos):
                tts.speak(tts.PHRASES["confirm"])
                self._process_selection()

            # Saltar ronda
            if self.btn_skip.collidepoint(pos):
                tts.speak(tts.PHRASES["skip"])
                self._next_round(force=True)

    def _process_selection(self):
        all_keys = set(self.current_pictos)
        for key in all_keys:
            self.engine.update(key, selected=(key in self.selected))

        self._next_round()

    def _next_round(self, force=False):
        self.engine.advance_round()
        if self.engine.is_confident() or self.engine.round_num >= MAX_ROUNDS:
            self.on_finish(self.engine)
        else:
            self._load_round()

    def update(self):
        # Animación de bounce: escala vuelve a 1.0 gradualmente
        for key in list(self.anim.keys()):
            current = self.anim[key]
            self.anim[key] = current + (1.0 - current) * 0.25
            if abs(self.anim[key] - 1.0) < 0.005:
                del self.anim[key]

    def draw(self, surf):
        surf.fill(C_BG)

        # Header
        header = pygame.Rect(0, 0, SCREEN_W, 80)
        draw_rounded_rect(surf, C_HEADER_BG, header, radius=0)
        title = self.font_header.render(TITLE, True, C_WHITE)
        surf.blit(title, (24, 14))

        # Indicador de ronda y confianza
        round_txt = self.font_sub.render(
            f"Ronda {self.engine.round_num + 1} de {MAX_ROUNDS}", True, C_TEXT_LIGHT
        )
        surf.blit(round_txt, (24, 46))

        _top_key, top_prob = self.engine.get_top_prediction()
        conf_txt = self.font_sub.render(
            f"Confianza actual: {int(top_prob * 100)}%", True, C_ACCENT
        )
        surf.blit(conf_txt, (SCREEN_W - conf_txt.get_width() - 20, 46))

        # Instrucción
        instr_font = pygame.font.SysFont("sans", 17)
        if self.engine.round_num == 0:
            instr = "¿Qué área describe mejor lo que quieres expresar?"
        else:
            instr = "Selecciona los pictogramas que se acercan a lo que sientes o necesitas."
        instr_surf = instr_font.render(instr, True, C_TEXT_DARK)
        surf.blit(instr_surf, (SCREEN_W // 2 - instr_surf.get_width() // 2, 100))

        # Barra de progreso de confianza
        bar_rect = pygame.Rect(SCREEN_W // 2 - 200, 128, 400, 10)
        pygame.draw.rect(surf, C_CARD_BORDER, bar_rect, border_radius=5)
        fill_w = int(bar_rect.width * top_prob)
        if fill_w > 0:
            fill_rect = pygame.Rect(bar_rect.x, bar_rect.y, fill_w, bar_rect.height)
            pygame.draw.rect(surf, C_SELECTED, fill_rect, border_radius=5)

        # Tarjetas de pictogramas
        for card in self.cards:
            key    = card["key"]
            rect   = card["rect"]
            image  = card["image"]
            is_sel = key in self.selected

            # Escala de animación
            scale = self.anim.get(key, 1.0)
            if scale != 1.0:
                cx, cy = rect.centerx, rect.centery
                new_w = int(CARD_W * scale)
                new_h = int(CARD_H * scale)
                draw_rect = pygame.Rect(cx - new_w // 2, cy - new_h // 2, new_w, new_h)
            else:
                draw_rect = rect

            # Sombra
            shadow = draw_rect.move(4, 4)
            pygame.draw.rect(surf, C_SHADOW, shadow, border_radius=14)

            # Fondo tarjeta
            bg_color = C_SELECTED if is_sel else C_CARD_BG
            draw_rounded_rect(surf, bg_color, draw_rect, radius=14,
                              border=2,
                              border_color=C_SELECTED if is_sel else C_CARD_BORDER)

            # Imagen escalada
            img_scaled = pygame.transform.smoothscale(
                image, (int(PICTO_SIZE[0] * scale), int(PICTO_SIZE[1] * scale))
            )
            img_x = draw_rect.x + (draw_rect.width - img_scaled.get_width()) // 2
            img_y = draw_rect.y + int(14 * scale)
            surf.blit(img_scaled, (img_x, img_y))

            # Etiqueta
            label = arasaac.get_label(key)
            lbl_color = C_WHITE if is_sel else C_TEXT_DARK
            lbl_surf = self.font_label.render(label, True, lbl_color)
            surf.blit(lbl_surf, (
                draw_rect.x + draw_rect.width // 2 - lbl_surf.get_width() // 2,
                draw_rect.y + draw_rect.height - 26,
            ))

            # Checkmark si seleccionado
            if is_sel:
                ck_font = pygame.font.SysFont("sans", 18, bold=True)
                ck = ck_font.render("✓", True, C_WHITE)
                surf.blit(ck, (draw_rect.right - 22, draw_rect.y + 6))

        # Botón Saltar
        skip_color = C_SHADOW if self.hovered_btn == "skip" else C_CARD_BORDER
        draw_rounded_rect(surf, skip_color, self.btn_skip, radius=12)
        skip_font = pygame.font.SysFont("sans", 17)
        skip_lbl = skip_font.render("Saltar ronda", True, C_TEXT_DARK)
        surf.blit(skip_lbl, (
            self.btn_skip.centerx - skip_lbl.get_width() // 2,
            self.btn_skip.centery - skip_lbl.get_height() // 2,
        ))

        # Botón Confirmar
        n_sel = len(self.selected)
        btn_color = C_BTN_HOVER if self.hovered_btn == "confirm" else C_BTN_PRIMARY
        draw_rounded_rect(surf, btn_color, self.btn_confirm, radius=12)
        btn_font = pygame.font.SysFont("sans", 17, bold=True)
        btn_lbl_txt = f"Confirmar ({n_sel})" if n_sel else "Confirmar"
        btn_lbl = btn_font.render(btn_lbl_txt, True, C_BTN_TEXT)
        surf.blit(btn_lbl, (
            self.btn_confirm.centerx - btn_lbl.get_width() // 2,
            self.btn_confirm.centery - btn_lbl.get_height() // 2,
        ))


class ResultScreen(Screen):
    def __init__(self, engine: InferenceEngine, on_restart):
        self.engine = engine
        self.on_restart = on_restart
        self.message = engine.get_message()
        self.top_n   = engine.get_top_n(3)
        self.btn_restart = pygame.Rect(SCREEN_W // 2 - 120, SCREEN_H - 90, 240, 52)
        self.hovered = False
        self.flash_alpha: int = 180  # arranca con flash blanco, se desvanece
        tts.speak(tts.PHRASES["result"] + " " + self.message)

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.btn_restart.collidepoint(event.pos)
        if event.type == pygame.MOUSEBUTTONDOWN and self.hovered:
            self.on_restart()

    def update(self):
        if self.flash_alpha > 0:
            self.flash_alpha = max(0, self.flash_alpha - 6)

    def draw(self, surf):
        surf.fill(C_BG)

        # Header
        header = pygame.Rect(0, 0, SCREEN_W, 80)
        draw_rounded_rect(surf, C_HEADER_BG, header, radius=0)
        hdr_font = pygame.font.SysFont("sans", 22, bold=True)
        hdr = hdr_font.render("¿Qué necesita?", True, C_WHITE)
        surf.blit(hdr, (SCREEN_W // 2 - hdr.get_width() // 2, 26))

        # Caja de mensaje principal
        msg_rect = pygame.Rect(60, 110, SCREEN_W - 120, 180)
        draw_rounded_rect(surf, C_RESULT_BG, msg_rect, radius=16,
                          border=2, border_color=C_RESULT_BORDER)
        msg_font = pygame.font.SysFont("sans", 18)
        draw_text_wrapped(surf, self.message, msg_font, C_TEXT_DARK,
                          msg_rect.inflate(-24, -24).move(12, 12))

        # Pictograma principal centrado
        top_key, _ = self.top_n[0]
        img_big = arasaac.get_image(top_key, (160, 160))
        img_x = SCREEN_W // 2 - 80
        surf.blit(img_big, (img_x, 310))

        # Etiqueta bajo el pictograma
        lbl_font = pygame.font.SysFont("sans", 18, bold=True)
        lbl_surf = lbl_font.render(arasaac.get_label(top_key), True, C_TEXT_DARK)
        surf.blit(lbl_surf, (SCREEN_W // 2 - lbl_surf.get_width() // 2, 480))

        # Flash de entrada (celebración)
        if self.flash_alpha > 0:
            flash_surf = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
            flash_surf.fill((255, 255, 255, self.flash_alpha))
            surf.blit(flash_surf, (0, 0))

        # Botón reiniciar
        btn_color = C_BTN_HOVER if self.hovered else C_BTN_PRIMARY
        draw_rounded_rect(surf, btn_color, self.btn_restart, radius=14)
        btn_font = pygame.font.SysFont("sans", 19, bold=True)
        btn_lbl  = btn_font.render("Nueva sesión", True, C_BTN_TEXT)
        surf.blit(btn_lbl, (
            self.btn_restart.centerx - btn_lbl.get_width() // 2,
            self.btn_restart.centery - btn_lbl.get_height() // 2,
        ))


# ---------------------------------------------------------------------------
# App principal
# ---------------------------------------------------------------------------

class App:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
        pygame.display.set_caption(TITLE)
        self.clock = pygame.time.Clock()
        self.current: Screen = StartScreen(on_start=self._start_game)

    def _start_game(self):
        self.current = GameScreen(on_finish=self._show_result)

    def _show_result(self, engine: InferenceEngine):
        self.current = ResultScreen(engine, on_restart=self._start_game)

    def run(self):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()
                self.current.handle_event(event)

            self.current.update()
            self.current.draw(self.screen)
            pygame.display.flip()
            self.clock.tick(FPS)


if __name__ == "__main__":
    App().run()
