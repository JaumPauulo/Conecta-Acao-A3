import unittest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

#  CONFIGURAÇÃO 
BASE_URL = "http://localhost/conecta-acao-main"

class TestesConectaAcao(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Inicializa o navegador uma vez para todos os testes."""
        service = Service(ChromeDriverManager().install())
        cls.driver = webdriver.Chrome(service=service)
        cls.driver.maximize_window()
        cls.driver.implicitly_wait(2) # Uma pequena espera global
        
        # --- DADOS DE TESTE GLOBAIS ---
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
        
        # Contas
        cls.email_doador = f"doador_{random_suffix}@teste.com"
        cls.email_ong = f"ong_{random_suffix}@teste.com"
        cls.senha_padrao = "123456"
        cls.senha_errada = "senhaErrada"
        
        # Pedidos
        cls.titulo_pedido_1 = f"Cestas Básicas {random_suffix}"
        cls.titulo_pedido_1_editado = f"Cestas Básicas (Editado) {random_suffix}"
        cls.titulo_pedido_2 = f"Roupas de Frio {random_suffix}"
        
        # Doação
        cls.mensagem_doacao = f"Entrega automatizada {random_suffix}"
        cls.nome_doador_fiel = "Doador Fiel"

    @classmethod
    def tearDownClass(cls):
        """Fecha o navegador ao final de todos os testes."""
        print("\n--- Fim da Suíte de Testes ---")
        cls.driver.quit()

    # TESTES DE ACESSO E SEGURANÇA 

    def test_01_cadastro_doador_sucesso(self):
        """[Grupo 1] Tenta cadastrar um novo Doador."""
        driver = self.driver
        print(f"\n[Teste 01] Cadastrando Doador: {self.email_doador}...")
        driver.get(f"{BASE_URL}/login_doador.html")
        driver.find_element(By.ID, "showRegisterDonor").click()
        WebDriverWait(driver, 2).until(EC.visibility_of_element_located((By.ID, "registerDonorForm")))
        
        form = driver.find_element(By.ID, "registerDonorForm")
        form.find_element(By.NAME, "nome").send_keys("Doador Selenium")
        form.find_element(By.NAME, "email").send_keys(self.email_doador)
        form.find_element(By.NAME, "telefone").send_keys("11999999999")
        form.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        form.find_element(By.XPATH, ".//button[contains(text(), 'Cadastrar')]").click()
        
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "banner.ok")))
        print(" Sucesso: Doador cadastrado.")

    def test_02_login_doador_falha(self):
        """[Grupo 1] Tenta logar como Doador com senha incorreta."""
        driver = self.driver
        print("\n[Teste 02] Testando login do Doador com falha...")
        driver.get(f"{BASE_URL}/login_doador.html")
        
        driver.find_element(By.NAME, "email").send_keys(self.email_doador)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_errada)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "banner.err")))
        self.assertIn("login_doador.html", driver.current_url) 
        print(" Sucesso: Banner de erro exibido.")

    def test_03_cadastro_ong_sucesso(self):
        """[Grupo 1] Tenta cadastrar uma nova ONG (CT01)."""
        driver = self.driver
        print(f"\n[Teste 03] Cadastrando ONG: {self.email_ong}...")
        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.ID, "showRegisterOng").click()
        WebDriverWait(driver, 2).until(EC.visibility_of_element_located((By.ID, "registerOngForm")))
        
        form = driver.find_element(By.ID, "registerOngForm")
        form.find_element(By.NAME, "nome").send_keys("ONG Automatizada")
        form.find_element(By.NAME, "cnpj").send_keys("12.345.678/0001-99")
        form.find_element(By.NAME, "email").send_keys(self.email_ong)
        form.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        form.find_element(By.XPATH, ".//button[contains(text(), 'Cadastrar ONG')]").click()
        
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "banner.ok")))
        print(" Sucesso: ONG cadastrada.")

    def test_04_login_ong_falha(self):
        """[Grupo 1] Tenta logar como ONG com senha incorreta."""
        driver = self.driver
        print("\n[Teste 04] Testando login da ONG com falha...")
        driver.get(f"{BASE_URL}/login_ong.html")
        
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_errada)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.CLASS_NAME, "banner.err")))
        self.assertIn("login_ong.html", driver.current_url) 
        print(" Sucesso: Banner de erro exibido.")

    # --- GRUPO 2: TESTES DE ONG  ---

    def test_05_login_ong_e_criar_pedidos(self):
        """[Grupo 2] Loga como ONG e cria DOIS pedidos (CT02, CT03)."""
        driver = self.driver
        print("\n[Teste 05] Logando como ONG e criando 2 pedidos...")

        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_ong.html"))
        
    
        driver.find_element(By.ID, "btnNovo").click()
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modalForm")))
        driver.find_element(By.ID, "titulo").send_keys(self.titulo_pedido_1)
        driver.find_element(By.ID, "categoria").send_keys("Alimentos")
        campo_qtd_1 = driver.find_element(By.ID, "quantidade")
        campo_qtd_1.clear() # Limpa o valor padrão "1"
        campo_qtd_1.send_keys("50")
        driver.find_element(By.ID, "btnSalvar").click()
        

        WebDriverWait(driver, 5).until_not(EC.visibility_of_element_located((By.ID, "modalForm")))
        driver.find_element(By.ID, "btnNovo").click()
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modalForm")))
        driver.find_element(By.ID, "titulo").send_keys(self.titulo_pedido_2)
        driver.find_element(By.ID, "categoria").send_keys("Roupas")
        campo_qtd_2 = driver.find_element(By.ID, "quantidade")
        campo_qtd_2.clear() # Limpa o valor padrão "1"
        campo_qtd_2.send_keys("100")
        driver.find_element(By.ID, "btnSalvar").click()

    
        WebDriverWait(driver, 5).until(EC.text_to_be_present_in_element((By.ID, "tbodyPedidos"), self.titulo_pedido_2))
        tabela_html = driver.find_element(By.ID, "tbodyPedidos").get_attribute('innerHTML')
        self.assertIn(self.titulo_pedido_1, tabela_html)
        self.assertIn(self.titulo_pedido_2, tabela_html)
        print(" Sucesso: Pedidos criados.")

    def test_06_editar_pedido_ong(self):
        """[Grupo 2] Loga como ONG e EDITA o Pedido 1."""
        driver = self.driver
        print("\n[Teste 06] Editando Pedido como ONG...")
        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_ong.html"))


        linha_pedido_1 = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, f"//tr[contains(., '{self.titulo_pedido_1}')]"))
        )
        linha_pedido_1.find_element(By.CSS_SELECTOR, "a[data-edit]").click()


        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modalForm")))
        campo_titulo = driver.find_element(By.ID, "titulo")
        campo_titulo.clear()
        campo_titulo.send_keys(self.titulo_pedido_1_editado)
        campo_qtd_edit = driver.find_element(By.ID, "quantidade")
        campo_qtd_edit.clear() 
        campo_qtd_edit.send_keys("50") 
        driver.find_element(By.ID, "btnSalvar").click()
        

        WebDriverWait(driver, 5).until(EC.text_to_be_present_in_element((By.ID, "tbodyPedidos"), self.titulo_pedido_1_editado))
        tabela_html = driver.find_element(By.ID, "tbodyPedidos").get_attribute('innerHTML')
        self.assertIn(self.titulo_pedido_1_editado, tabela_html)
        self.assertNotIn(self.titulo_pedido_1, tabela_html)
        print(" Sucesso: Pedido editado.")
        
    def test_07_excluir_pedido_ong(self):
        """[Grupo 2] Loga como ONG e EXCLUI o Pedido 2."""
        driver = self.driver
        print("\n[Teste 07] Excluindo Pedido como ONG...")
        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_ong.html"))

        linha_pedido_2 = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, f"//tr[contains(., '{self.titulo_pedido_2}')]"))
        )
        linha_pedido_2.find_element(By.CSS_SELECTOR, "a[data-del]").click()
        
        WebDriverWait(driver, 5).until(EC.alert_is_present()).accept()
        
        WebDriverWait(driver, 10).until(
            EC.text_to_be_present_in_element((By.ID, "tbodyPedidos"), self.titulo_pedido_1_editado)
        )
        
        tabela_html = driver.find_element(By.ID, "tbodyPedidos").get_attribute('innerHTML')
        self.assertNotIn(self.titulo_pedido_2, tabela_html) # Pedido 2 foi excluído
        self.assertIn(self.titulo_pedido_1_editado, tabela_html) # Pedido 1 ainda existe
        print(" Sucesso: Pedido excluído.")
        
    #  TESTES DE DOADOR

    def test_08_login_doador_e_filtrar(self):
        """[Grupo 3] Loga como Doador e testa o filtro de pedidos."""
        driver = self.driver
        print("\n[Teste 08] Testando filtro no Painel do Doador...")
        driver.get(f"{BASE_URL}/login_doador.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_doador)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_doador.html"))

    
        WebDriverWait(driver, 10).until(
            EC.text_to_be_present_in_element((By.ID, "pedidosGrid"), self.titulo_pedido_1_editado)
        )
        
    
        driver.find_element(By.ID, "categoria").send_keys("Alimentos")
        driver.find_element(By.ID, "btnFiltrar").click()
        time.sleep(2) 
        

        grid_html = driver.find_element(By.ID, "pedidosGrid").get_attribute('innerHTML')
        self.assertIn(self.titulo_pedido_1_editado, grid_html)
        
    
        driver.find_element(By.ID, "categoria").send_keys("Roupas")
        driver.find_element(By.ID, "btnFiltrar").click()
        time.sleep(2)
        
    
        grid_html = driver.find_element(By.ID, "pedidosGrid").get_attribute('innerHTML')
        self.assertIn("Nenhum pedido encontrado", grid_html)
        print(" Sucesso: Filtro de categoria funcionou.")
        
    def test_09_fluxo_doacao_doador(self):
        """[Grupo 3] Doador faz uma doação (CT04 - Lado Doador)."""
        driver = self.driver
        print("\n[Teste 09] Doador realizando doação...")
        driver.get(f"{BASE_URL}/login_doador.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_doador)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_doador.html"))

    
        card_pedido = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, f"//article[contains(., '{self.titulo_pedido_1_editado}')]"))
        )
        card_pedido.find_element(By.CSS_SELECTOR, "button[data-open]").click()


        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modal")))
        driver.find_element(By.ID, "dNome").send_keys(self.nome_doador_fiel)
        driver.find_element(By.ID, "dContato").send_keys("email@contato.com")
        campo_qtd_doacao = driver.find_element(By.ID, "dQtd")
        campo_qtd_doacao.clear() 
        campo_qtd_doacao.send_keys("5")
        driver.find_element(By.ID, "dMsg").send_keys(self.mensagem_doacao) 
        driver.find_element(By.ID, "btnEnviarDoacao").click()
        print("...Doação enviada, aguardando JS recarregar...")
        
    
        WebDriverWait(driver, 10).until(
             EC.text_to_be_present_in_element((By.XPATH, f"//article[contains(., '{self.titulo_pedido_1_editado}')]"), "Já doou aqui")
        )
        card_html = driver.find_element(By.XPATH, f"//article[contains(., '{self.titulo_pedido_1_editado}')]").get_attribute('innerHTML')
        self.assertIn("Já doou aqui", card_html)
        print(" Sucesso: Doação enviada e card atualizado.")

    # TESTES DE FLUXO (KANBAN E FINALIZAÇÃO) 

    def test_10_validar_kanban_pendente_ong(self):
        """[Grupo 4] ONG vê doação no Kanban (CT04 - Lado ONG)."""
        driver = self.driver
        print("\n[Teste 10] ONG validando Kanban 'Pendente'...")
        # 1. Login ONG
        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_ong.html"))

        badge_xpath = f"//tr[contains(., '{self.titulo_pedido_1_editado}')]//span[contains(text(), 'Pendentes: ')]"
        try:
            badge = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, badge_xpath))
            )
            self.assertTrue(badge.is_displayed())
        except:
            self.fail(f"FALHA: O badge 'Pendentes' não foi encontrado para o pedido '{self.titulo_pedido_1_editado}'.")
        
    
        linha_pedido = driver.find_element(By.XPATH, f"//tr[contains(., '{self.titulo_pedido_1_editado}')]")
        linha_pedido.find_element(By.CSS_SELECTOR, "a[data-intencoes]").click()
        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modalIntencoes")))
        
        col_pendentes = driver.find_element(By.ID, "colPendentes")
        self.assertIn(self.mensagem_doacao, col_pendentes.text)
        self.assertIn(self.nome_doador_fiel, col_pendentes.text)
        print(" Sucesso: Doação encontrada em 'Pendentes'.")

    def test_11_concluir_doacao_kanban_ong(self):
        """[Grupo 4] ONG marca doação como 'Concluída' (CT05)."""
        driver = self.driver
        print("\n[Teste 11] ONG concluindo doação no Kanban...")
        driver.get(f"{BASE_URL}/login_ong.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_ong)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_ong.html"))

        button_intencoes_xpath = f"//tr[contains(., '{self.titulo_pedido_1_editado}')]//a[@data-intencoes]"
        try:
            intencoes_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, button_intencoes_xpath))
            )
            intencoes_button.click()
        except:
            self.fail(f"FALHA: Não foi possível clicar em 'Intenções' para o pedido '{self.titulo_pedido_1_editado}'.")

        WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "modalIntencoes")))

        card_doacao = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, f"//div[contains(@class, 'kcard') and contains(., '{self.mensagem_doacao}')]"))
        )
        card_doacao.find_element(By.CSS_SELECTOR, "button[data-done]").click()
        
        WebDriverWait(driver, 5).until_not(
            EC.text_to_be_present_in_element((By.ID, "colPendentes"), self.mensagem_doacao)
        )
        col_concluidas = driver.find_element(By.ID, "colConcluidas")
        self.assertIn(self.mensagem_doacao, col_concluidas.text)
        col_pendentes = driver.find_element(By.ID, "colPendentes")
        self.assertNotIn(self.mensagem_doacao, col_pendentes.text)
        print(" Sucesso: Doação movida para 'Concluídas'.")

    def test_12_validar_feedback_concluido_doador(self):
        """[Grupo 4] Doador vê o status "Restante" atualizado (50 - 5 = 45)."""
        driver = self.driver
        print("\n[Teste 12] Doador validando status 'Restante'...")
        driver.get(f"{BASE_URL}/login_doador.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_doador)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_doador.html"))
        
        card_locator = (By.XPATH, f"//article[contains(., '{self.titulo_pedido_1_editado}')]")
        
        try:
            WebDriverWait(driver, 10).until(
                EC.text_to_be_present_in_element(card_locator, "Restante: 45")
            )
            card_pedido = driver.find_element(*card_locator) # Adicionado o '*'
            self.assertIn("Restante: 45", card_pedido.text)
            print(" Sucesso: Cálculo de 'Restante' atualizado.")
        except Exception as e:
            card_pedido_texto = ""
            try:
                card_pedido_texto = driver.find_element(*card_locator).text 
            except:
                pass 
            self.fail(f"FALHA: O texto 'Restante: 45' não foi encontrado. O texto atual é: '{card_pedido_texto}'\nErro: {e}")

    def test_13_logout_doador(self):
        """[Grupo 4] Verifica se o botão Sair funciona."""
        driver = self.driver
        print("\n[Teste 13] Testando Logout do Doador...")
        driver.get(f"{BASE_URL}/login_doador.html")
        driver.find_element(By.NAME, "email").send_keys(self.email_doador)
        driver.find_element(By.NAME, "senha").send_keys(self.senha_padrao)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Entrar')]").click()
        WebDriverWait(driver, 5).until(EC.url_contains("painel_doador.html"))

        driver.find_element(By.XPATH, "//a[@href='php/actions/logout.php' and contains(text(), 'Sair')]").click()
        
        WebDriverWait(driver, 5).until(EC.url_contains("index.html"))
        self.assertIn("index.html", driver.current_url)
        print("✅ Sucesso: Logout efetuado.")

if __name__ == "__main__":
    unittest.main()