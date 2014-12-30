<xsl:template match="po">
	<xsl:if test="owner">
		<div class="post_h">
			<p>
				发信人:
				<a class="powner" href="qry?u={owner}">
					<xsl:value-of select="owner"/>
				</a>
				(
				<xsl:value-of select="nick"/>
				), 信区:
				<a href="doc?board={board}">
					<xsl:value-of select="board"/>
				</a>
			</p>
			<p>
				标  题:
				<span class="ptitle">
					<xsl:value-of select="title"/>
				</span>
			</p>
			<p>
				发信站:
				<xsl:value-of select="$bbsname"/>
				(
				<xsl:value-of select="date"/>
				), 站内信件
			</p>
		</div>
	</xsl:if>
	<xsl:for-each select="pa">
		<div class="post_{@m}">
			<xsl:for-each select="p">
				<p>
					<xsl:apply-templates select="."/>
				</p>
			</xsl:for-each>
		</div>
	</xsl:for-each>
</xsl:template>
<xsl:template match="br">...</xsl:template>
<xsl:template match="c">...</xsl:template>
<xsl:template match="a">...</xsl:template>
<xsl:template name="con-linkbar">
	<xsl:variable name="param">
		bid=
		<xsl:value-of select="@bid"/>
		&f=
		<xsl:value-of select="po/@fid"/>
	</xsl:variable>
	<xsl:if test="po/@nore">
		<span class="disabled">本文不可回复</span>
	</xsl:if>
	<xsl:if test="not(po/@nore) and @link="con"">
		<a class="reply">
			<xsl:attribute name="href">
				pst?
				<xsl:value-of select="$param"/>
			</xsl:attribute>
			回复本文
		</a>
	</xsl:if>
	<xsl:if test="po/@edit">
		<a href="edit?{$param}">修改</a>
		<a href="del?{$param}">删除</a>
	</xsl:if>
	<a href="ccc?{$param}" class="crosspost">转载</a>
	<a href="fwd?{$param}">转寄</a>
</xsl:template>
<xsl:template match="bbstcon">
	<div class="pnav">
		<xsl:call-template name="tcon-navbar"/>
		<xsl:call-template name="sigature-options"/>
	</div>
	<xsl:for-each select="po">
		<div class="post">
			<div class="pmain">
				<xsl:apply-templates select="."/>
			</div>
			<div class="plink">
				<xsl:if test="@nore">
					<span class="disabled">本文不可回复</span>
				</xsl:if>
				<xsl:if test="not(@nore)">
					<a class="reply" href="pst?bid={../@bid}&f={@fid}">回复本文</a>
				</xsl:if>
				<a href="ccc?bid={../@bid}&f={@fid}" class="crosspost">转载</a>
				<a href="con?new=1&bid={../@bid}&f={@fid}">
					<img src="../images/button/content.gif"/>
					本文链接
				</a>
			</div>
		</div>
	</xsl:for-each>
	<div class="pnav">
		<xsl:call-template name="tcon-navbar"/>
	</div>
	<xsl:call-template name="quick-reply-form"/>
	<xsl:call-template name="quick-cp-form"/>
</xsl:template>
<xsl:template name="tcon-navbar">
	<a href="{/bbstcon/session/@m}doc?bid={@bid}">
		<img src="../images/button/home.gif"/>
		本讨论区
	</a>
	<xsl:if test="count(po) = @page">
		<a href="tcon?new=1&bid={@bid}&g={@gid}&f={po[last()]/@fid}&a=n">
			<img src="../images/button/down.gif"/>
			下页
		</a>
	</xsl:if>
	<xsl:if test="po[1]/@fid != @gid">
		<a href="tcon?new=1&bid={@bid}&g={@gid}&f={po[1]/@fid}&a=p">
			<img src="../images/button/up.gif"/>
			上页
		</a>
	</xsl:if>
	<xsl:if test="not(@tlast)">
		<a href="tcon?new=1&bid={@bid}&f={@gid}&a=a">下一主题</a>
	</xsl:if>
	<xsl:if test="not(@tfirst)">
		<a href="tcon?new=1&bid={@bid}&f={@gid}&a=b">上一主题</a>
	</xsl:if>
</xsl:template>